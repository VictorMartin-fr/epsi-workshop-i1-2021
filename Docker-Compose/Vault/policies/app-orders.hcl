path "transit/encrypt/orders" {
   capabilities = [ "update" ]
}

path "transit/decrypt/orders" {
   capabilities = [ "update" ]
}

# List existing keys in UI
path "transit/keys" {
   capabilities = [ "list" ]
}

# Enable to select the orders key in UI
path "transit/keys/orders" {
   capabilities = [ "read" ]
}