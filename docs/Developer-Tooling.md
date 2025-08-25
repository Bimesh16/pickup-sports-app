# Developer Tooling

## Password Hash Generator

Generate a BCrypt hash for a plaintext password. The tool accepts the password
as its first command-line argument.

```bash
./mvnw -q -f tooling/pom.xml exec:java -Dexec.args='myPassword'
```

The hashed output prints to standard out.
