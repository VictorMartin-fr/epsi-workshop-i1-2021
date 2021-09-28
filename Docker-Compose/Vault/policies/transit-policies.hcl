# Enable Transit secrets engine

path "sys/mounts/transit" {
    capabilities = [ "create", "read", "update", "delete", "list" ]
}

# To read enabled secrets engines

path "sys/mounts" {
    capabilities = [ "read" ]
}

# Manage the transit secrets engine

path "transit/*" {
    capabilities = [ "create", "read", "update", "delete", "list" ]
}

path "transit/encrypt/order-key" {
    capabilities = [ "update" ]
}

path "transit/decrypt/order-key" {
    capabilities = [ "update" ]
}