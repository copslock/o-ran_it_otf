from app import create_app

if __name__ == '__main__':
    app = create_app()

    # Set SSL context with the certificate chain and the private RSA key.
    context = ('opt/cert/otf.pem', 'opt/cert/privateKey.pem')
    app.run(
        debug=app.config['DEBUG'],
        host='0.0.0.0', port=5000,
        use_reloader=True,
        ssl_context=context)
    # Run without ssl
	# app.run(debug=app.config['DEBUG'], host='0.0.0.0', use_reloader=True, port=5000)