const fs = require('fs');
const file = 'src/views/pages/authentication/jwt/AuthLogin.jsx';
let content = fs.readFileSync(file, 'utf8');
let lines = content.split(/\r?\n/);

// 1. Add import
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("import { getFaceDescriptor } from 'utils/faceApi';")) {
    lines[i] = "import { getFaceDescriptor } from 'utils/faceApi';\nimport FaceDetectionDashboard from './FaceDetectionDashboard';";
    break;
  }
}

// 2. Splice the form section
let formStartIdx = -1;
let formEndIdx = -1;
let animatePresenceEndIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === "{loginMethod === 'password' && (") {
    formStartIdx = i;
  }
  if (lines[i].trim() === "</form>" && formEndIdx === -1) {
    // There are two </form>s? Wait, no, only one. But let's check.
    formEndIdx = i;
  }
  if (lines[i].trim() === "</AnimatePresence>") {
    animatePresenceEndIdx = i;
  }
}

console.log("Found indices:", formStartIdx, formEndIdx, animatePresenceEndIdx);

if (formStartIdx !== -1 && formEndIdx !== -1 && animatePresenceEndIdx !== -1) {
  const newForm = `                  {/* Both Password and FaceID (trigger) fields */}
                  <Box sx={{ minHeight: 292, display: 'flex', flexDirection: 'column', justifyContent: 'center', mb: 2 }}>
                    <CustomFormControl fullWidth error={Boolean(touched.email && errors.email)} sx={{ mb: 2 }}>
                      <InputLabel htmlFor="login-userid">User ID / Email</InputLabel>
                      <OutlinedInput
                        id="login-userid"
                        type="text"
                        value={values.email}
                        name="email"
                        onBlur={handleBlur}
                        onChange={(e) => {
                          handleChange(e);
                          if (checkError) setCheckError(null);
                        }}
                        label="User ID / Email"
                        autoComplete="username"
                        sx={{
                          borderRadius: '12px',
                          bgcolor: alpha(theme.palette.background.paper, 0.5),
                          backdropFilter: 'blur(4px)'
                        }}
                      />
                      {touched.email && errors.email && (
                        <FormHelperText error id="standard-weight-helper-text-email-login">
                          {errors.email}
                        </FormHelperText>
                      )}
                    </CustomFormControl>

                    <CustomFormControl fullWidth error={Boolean(touched.password && errors.password)}>
                      <InputLabel htmlFor="login-password">Password</InputLabel>
                      <OutlinedInput
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={values.password}
                        name="password"
                        onBlur={handleBlur}
                        onChange={(e) => {
                          handleChange(e);
                          if (checkError) setCheckError(null);
                        }}
                        label="Password"
                        autoComplete="current-password"
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                              size="large"
                            >
                              {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        }
                        sx={{
                          borderRadius: '12px',
                          bgcolor: alpha(theme.palette.background.paper, 0.5),
                          backdropFilter: 'blur(4px)'
                        }}
                      />
                      {touched.password && errors.password && (
                        <FormHelperText error id="standard-weight-helper-text-password-login">
                          {errors.password}
                        </FormHelperText>
                      )}
                    </CustomFormControl>
                  </Box>

                  {checkError && (
                    <Box sx={{ mt: 2 }}>
                      <Alert
                        severity="error"
                        variant="outlined"
                        sx={{
                          borderRadius: '12px',
                          bgcolor: alpha(theme.palette.error.light, 0.1),
                          borderColor: alpha(theme.palette.error.main, 0.2),
                          color: theme.palette.error.dark,
                          fontWeight: 500
                        }}
                      >
                        {checkError}
                      </Alert>
                    </Box>
                  )}

                  <Box sx={{ mt: 4 }}>
                    <AnimateButton>
                      <Button
                        color="primary"
                        disabled={isChecking || loginMethod === 'face'}
                        fullWidth
                        size="large"
                        type="submit"
                        variant="contained"
                        startIcon={isChecking ? <CircularProgress size={18} color="inherit" /> : <IconLock size={18} />}
                        sx={{
                          borderRadius: '14px',
                          fontWeight: 700,
                          py: 1.6,
                          fontSize: '1rem',
                          boxShadow: \`0 8px 20px \${alpha(theme.palette.primary.main, 0.3)}\`,
                          '&:hover': {
                            boxShadow: \`0 10px 25px \${alpha(theme.palette.primary.main, 0.4)}\`,
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        {isChecking ? 'Verifying Credentials…' : 'Continue'}
                      </Button>
                    </AnimateButton>
                  </Box>
                </form>`.split('\n');

  lines.splice(formStartIdx, formEndIdx - formStartIdx + 1, ...newForm);
  
  // Recalculate animatePresenceEndIdx after splice
  animatePresenceEndIdx = lines.findIndex(line => line.trim() === "</AnimatePresence>");
  
  const dashboardElement = `      <FaceDetectionDashboard
        open={loginMethod === 'face' && step === 'credentials'}
        onClose={() => setLoginMethod('password')}
        webcamActive={webcamActive}
        webcamError={webcamError}
        isFaceScanning={isFaceScanning}
      />
      </AnimatePresence>`.split('\n');

  lines.splice(animatePresenceEndIdx, 1, ...dashboardElement);
  
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  console.log("File patched successfully!");
} else {
  console.log("Could not find required blocks in AuthLogin.jsx");
}
