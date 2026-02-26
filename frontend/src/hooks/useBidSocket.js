/**
 * useBidSocket.js
 *
 * Custom React hook for live auction bidding via WebSockets (socket.io-client).
 *
 * Usage:
 *   const { currentBid, totalBids, bids, isConnected } = useBidSocket(auctionId, initialBid, initialBids);
 *
 * What it does:
 *   1. Connects to the backend SocketIO server on mount
 *   2. Joins the room "auction_{auctionId}"
 *   3. Listens for "bid_update" events and merges them into local state
 *   4. On unmount, leaves the room and disconnects cleanly
 *
 * The REST POST for placing a bid still goes through the normal API call.
 * WebSocket is RECEIVE-only from the client's perspective.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

// In dev mode: connect to same origin so Vite proxy forwards /socket.io → Flask:5000
// In production: set VITE_WS_URL=https://backend.yourdomain.com in your .env
const WS_URL = import.meta.env.VITE_WS_URL
  || (import.meta.env.DEV ? window.location.origin : import.meta.env.VITE_API_URL?.replace('/api', ''))
  || 'http://localhost:5000';

export function useBidSocket(auctionId, initialBid = 0, initialBids = []) {
  const [currentBid, setCurrentBid]   = useState(Number(initialBid));
  const [totalBids, setTotalBids]     = useState(initialBids.length);
  const [bids, setBids]               = useState(initialBids);
  const [isConnected, setIsConnected] = useState(false);
  const [lastBidder, setLastBidder]   = useState(null);
  const [auctionClosed, setAuctionClosed] = useState(null); // { winner_name, winning_bid, closed_at }

  const socketRef = useRef(null);

  // Keep a stable ref so the callback never goes stale
  const auctionIdRef = useRef(auctionId);
  useEffect(() => { auctionIdRef.current = auctionId; }, [auctionId]);

  // Sync initial values when auction data loads from REST
  useEffect(() => {
    setCurrentBid(Number(initialBid));
    setTotalBids(initialBids.length);
    setBids(initialBids);
  }, [initialBid, initialBids.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!auctionId) return;

    // ── Connect ──────────────────────────────────────────────────────────────
    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],   // prefer WS, fall back to polling
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      timeout: 10000,
    });
    socketRef.current = socket;

    // ── Connection events ─────────────────────────────────────────────────────
    socket.on('connect', () => {
      setIsConnected(true);
      // Join the auction room
      socket.emit('join_auction', { auction_id: auctionId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    // ── Live bid update ───────────────────────────────────────────────────────
    // Shape: { auction_id, current_bid, total_bids, bidder_name, bid_time, amount }
    socket.on('bid_update', (data) => {
      if (Number(data.auction_id) !== Number(auctionIdRef.current)) return;

      const newBid = {
        amount:      data.amount,
        bid_time:    data.bid_time,
        bidder_name: data.bidder_name,
        created_at:  data.bid_time,
      };

      setCurrentBid(Number(data.current_bid));
      setTotalBids(Number(data.total_bids));
      setLastBidder(data.bidder_name);

      // Prepend new bid to the top of the list (highest → lowest order)
      setBids((prev) => [newBid, ...prev]);
    });

    // ── Auction closed event ──────────────────────────────────────────────────
    // Shape: { auction_id, winner_name, winning_bid, closed_at }
    socket.on('auction_closed', (data) => {
      if (Number(data.auction_id) !== Number(auctionIdRef.current)) return;
      setAuctionClosed(data);
    });

    // ── Cleanup on unmount ────────────────────────────────────────────────────
    return () => {
      socket.emit('leave_auction', { auction_id: auctionId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [auctionId]); // only re-run if the auction changes

  return { currentBid, totalBids, bids, isConnected, lastBidder, auctionClosed };
}
