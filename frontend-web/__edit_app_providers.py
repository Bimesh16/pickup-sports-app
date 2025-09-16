from pathlib import Path

path = Path('src/App.tsx')
text = path.read_text()
old = "      <QueryClientProvider client={queryClient}>\n        <AuthProvider>\n          <LocationProvider>\n            <AppInner />\n          </LocationProvider>\n        </AuthProvider>\n      </QueryClientProvider>"
new = "      <QueryClientProvider client={queryClient}>\n        <AuthProvider>\n          <ThemeProvider>\n            <AppStateProvider>\n              <LocationProvider>\n                <AppInner />\n              </LocationProvider>\n            </AppStateProvider>\n          </ThemeProvider>\n        </AuthProvider>\n      </QueryClientProvider>"
if old in text:
    text = text.replace(old, new, 1)
    path.write_text(text)
