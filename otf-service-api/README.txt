You must setup environment variables to run and test locally
These environment variables will be secretes when deployed on kubernetes.
	AAF_ID (mechid for cadi aaf)
	AAF_PASSWORD (password for mechid)
	CADI_KEYFILE (cadi keyfile location for aaf)
		
		Generate AAF_PASSWORD and CADI_KEYFILE:
			java -jar cadi-core-1.4.2.jar keygen keyfile
			java -jar cadi-core-1.4.2.jar digest AAF_MECHID_PASSWORD keyfile  > digest.txt 2>&1
	
	AAF_PERM_TYPE (permission type to check for when authorization a user)
	
	