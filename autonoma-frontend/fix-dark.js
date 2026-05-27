const fs = require('fs');
let c = fs.readFileSync('src/views/dashboard/UserTaskQueue/index.jsx', 'utf8');

// 1. Add useColorScheme import
c = c.replace(/import \{ useTheme \}/, 'import { useTheme, useColorScheme }');

// 2. Change styled components to take isDark prop again
c = c.replace(/const PageRoot = styled\(Box\)\(\(\{ theme \}\) => \{/g, 'const PageRoot = styled(Box, { shouldForwardProp: (p) => p !== "isDark" })(({ theme, isDark }) => {');
c = c.replace(/const HeroBanner = styled\(Box\)\(\(\{ theme \}\) => \{/g, 'const HeroBanner = styled(Box, { shouldForwardProp: (p) => p !== "isDark" })(({ theme, isDark }) => {');
c = c.replace(/const TaskCard = styled\(Box\)\(\(\{ theme, isoverdue, taskpalette = 'indigo' \}\) => \{/g, 'const TaskCard = styled(Box, { shouldForwardProp: (p) => p !== "isDark" })(({ theme, isDark, isoverdue, taskpalette = "indigo" }) => {');
c = c.replace(/const StatBubble = styled\(Box\)\(\(\{ theme \}\) => \{/g, 'const StatBubble = styled(Box, { shouldForwardProp: (p) => p !== "isDark" })(({ theme, isDark }) => {');
c = c.replace(/const MetricIconWrap = styled\(Box\)\(\(\{ theme, palettekey = 'indigo' \}\) => \{/g, 'const MetricIconWrap = styled(Box, { shouldForwardProp: (p) => p !== "isDark" })(({ theme, isDark, palettekey = "indigo" }) => {');
c = c.replace(/const FilterBar = styled\(Box\)\(\(\{ theme \}\) => \{/g, 'const FilterBar = styled(Box, { shouldForwardProp: (p) => p !== "isDark" })(({ theme, isDark }) => {');
c = c.replace(/const FilterChip = styled\(Box\)\(\(\{ theme, active \}\) => \{/g, 'const FilterChip = styled(Box, { shouldForwardProp: (p) => p !== "isDark" })(({ theme, isDark, active }) => {');
c = c.replace(/const TaskIconAvatar = styled\(Avatar\)\(\(\{ palettekey = 'indigo', theme \}\) => \{/g, 'const TaskIconAvatar = styled(Avatar, { shouldForwardProp: (p) => p !== "isDark" })(({ theme, isDark, palettekey = "indigo" }) => {');
c = c.replace(/const TypeBadge = styled\(Box\)\(\(\{ palettekey = 'indigo', theme \}\) => \{/g, 'const TypeBadge = styled(Box, { shouldForwardProp: (p) => p !== "isDark" })(({ theme, isDark, palettekey = "indigo" }) => {');
c = c.replace(/const StatusBadge = styled\(Box\)\(\(\{ statuscolor, statusbg, theme \}\) => \(\{/g, 'const StatusBadge = styled(Box, { shouldForwardProp: (p) => p !== "isDark" })(({ theme, isDark, statuscolor, statusbg }) => ({');
c = c.replace(/const DueDateBadge = styled\(Box\)\(\(\{ theme, isoverdue \}\) => \{/g, 'const DueDateBadge = styled(Box, { shouldForwardProp: (p) => p !== "isDark" })(({ theme, isDark, isoverdue }) => {');

// Remove inner isDark declarations
c = c.replace(/  const isDark = theme\.palette\.mode === 'dark';\r?\n/g, '');

// 3. Update main component
c = c.replace(/  const theme = useTheme\(\);\r?\n  const isDark = theme\.palette\.mode === 'dark';/g, '  const theme = useTheme();\n  const { colorScheme } = useColorScheme();\n  const isDark = colorScheme === "dark";');

// 4. Pass isDark to components
c = c.replace(/<PageRoot>/g, '<PageRoot isDark={isDark}>');
c = c.replace(/<HeroBanner>/g, '<HeroBanner isDark={isDark}>');
c = c.replace(/<StatBubble>/g, '<StatBubble isDark={isDark}>');
c = c.replace(/<FilterBar>/g, '<FilterBar isDark={isDark}>');
c = c.replace(/<FilterChip/g, '<FilterChip isDark={isDark}');
c = c.replace(/<MetricIconWrap/g, '<MetricIconWrap isDark={isDark}');
c = c.replace(/<TaskIconAvatar/g, '<TaskIconAvatar isDark={isDark}');
c = c.replace(/<TypeBadge/g, '<TypeBadge isDark={isDark}');
c = c.replace(/<StatusBadge/g, '<StatusBadge isDark={isDark}');
c = c.replace(/<DueDateBadge/g, '<DueDateBadge isDark={isDark}');

// 5. Restore DashboardMetricCard isDark prop
c = c.replace(/theme=\{theme\}\r?\n                  active=\{activeTab === mod\.tabIndex\}/g, 'theme={theme}\n                  isDark={isDark}\n                  active={activeTab === mod.tabIndex}');

// 6. Fix TaskCard usages
c = c.replace(/<TaskCard key=\{i\} isoverdue="false" taskpalette="slate"/g, '<TaskCard key={i} isDark={isDark} isoverdue="false" taskpalette="slate"');
c = c.replace(/<TaskCard key=\{task\.id \|\| i\} isoverdue=\{overdue\.toString\(\)\} taskpalette=\{cfg\.palette\}/g, '<TaskCard key={task.id || i} isDark={isDark} isoverdue={overdue.toString()} taskpalette={cfg.palette}');


fs.writeFileSync('src/views/dashboard/UserTaskQueue/index.jsx', c);
console.log("Done");
