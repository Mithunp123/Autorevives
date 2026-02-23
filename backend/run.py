from app import create_app

app = create_app()

if __name__ == "__main__":
    # Initialize the database on first run
    from app import db
    try:
        db.init_db()
    except Exception as e:
        print(f"DB init note: {e}")

    # Run with waitress for production, or Flask dev server
    import os
    if os.getenv("FLASK_ENV") == "development":
        app.run(host="0.0.0.0", port=5000, debug=True)
    else:
        from waitress import serve
        print("Starting AutoRevive API on http://0.0.0.0:5006")
        serve(app, host="0.0.0.0", port=5006)
