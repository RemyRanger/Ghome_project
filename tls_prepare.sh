#apt install openssl

# Generate enc key
openssl genrsa -des3 -out server.enc.key 1024

# Generate a CSR (Certificate Signing Reqest)
openssl req -new -key server.enc.key -out server.csr

#Remove 3DES enc
openssl rsa -in server.enc.key -out server.key

#Generate a temporary certificate
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
