package com.autonoma.erp.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.List;

@Component
public class FrontendBuildRunner {

    private static final Logger log = LoggerFactory.getLogger(FrontendBuildRunner.class);

    /**
     * Executes the frontend build process:
     * 1. Detect project locations relative to workspace.
     * 2. Run npm install (if needed)
     * 3. Run npm run build
     * 4. Clean backend's static directory.
     * 5. Copy generated build output into backend's static directory.
     *
     * @param frontendPathOverride Optional custom path to the frontend project (null or empty for auto-detect).
     * @param targetStaticPathOverride Optional custom path to the backend static resource folder.
     * @return true if the build succeeded, false otherwise.
     */
    public boolean runBuild(String frontendPathOverride, String targetStaticPathOverride) {
        log.info("Starting frontend build integration process...");

        try {
            // 1. Resolve frontend and backend paths
            File frontendDir = resolveFrontendDirectory(frontendPathOverride);
            File staticDir = resolveTargetStaticDirectory(targetStaticPathOverride);

            log.info("Resolved Frontend directory: {}", frontendDir.getAbsolutePath());
            log.info("Resolved Static target directory: {}", staticDir.getAbsolutePath());

            // Validate frontend structure
            File packageJson = new File(frontendDir, "package.json");
            if (!packageJson.exists()) {
                log.error("Invalid frontend directory structure: package.json not found in {}", frontendDir.getAbsolutePath());
                return false;
            }

            // 2. Install dependencies (npm install)
            boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");
            
            // We can optimize npm install by checking if node_modules exists, but sometimes we want to run it anyway.
            // Let's run it.
            log.info("Executing npm install...");
            if (!executeCommand(frontendDir, isWindows, "npm", "install")) {
                log.error("Failed to execute npm install.");
                return false;
            }

            // 3. Build frontend (npm run build)
            log.info("Executing npm run build...");
            if (!executeCommand(frontendDir, isWindows, "npm", "run", "build")) {
                log.error("Failed to execute npm run build.");
                return false;
            }

            // Find build output directory. Vite defaults to "dist".
            File distDir = new File(frontendDir, "dist");
            if (!distDir.exists() || !distDir.isDirectory()) {
                // Fallback check for "build" folder (e.g. React CRA)
                distDir = new File(frontendDir, "build");
                if (!distDir.exists() || !distDir.isDirectory()) {
                    log.error("Frontend build output directory ('dist' or 'build') not found in {}", frontendDir.getAbsolutePath());
                    return false;
                }
            }
            log.info("Found frontend build output directory: {}", distDir.getAbsolutePath());

            // 4. Clean backend static folder
            log.info("Cleaning backend static folder: {}", staticDir.getAbsolutePath());
            cleanDirectory(staticDir);

            // 5. Copy generated build output
            log.info("Copying build files from {} to {}", distDir.getAbsolutePath(), staticDir.getAbsolutePath());
            copyDirectory(distDir.toPath(), staticDir.toPath());

            log.info("Frontend build integration completed successfully!");
            return true;

        } catch (Exception e) {
            log.error("Error occurred during frontend build and sync process: {}", e.getMessage(), e);
            return false;
        }
    }

    private File resolveFrontendDirectory(String override) throws IOException {
        if (override != null && !override.trim().isEmpty()) {
            File customPath = new File(override.trim());
            if (customPath.exists() && customPath.isDirectory()) {
                return customPath.getAbsoluteFile();
            }
            log.warn("Provided frontend path override does not exist or is not a directory: {}. Reverting to auto-detection.", override);
        }

        // Auto-detect path
        String userDirProp = System.getProperty("user.dir");
        if (userDirProp == null) {
            throw new IOException("Unable to determine current working directory (user.dir is null)");
        }
        File currentDir = new File(userDirProp).getAbsoluteFile();

        // Check if current directory is 'autonoma-backend'
        if ("autonoma-backend".equalsIgnoreCase(currentDir.getName())) {
            File sibling = new File(currentDir.getParentFile(), "autonoma-frontend");
            if (sibling.exists() && sibling.isDirectory()) {
                return sibling;
            }
        }

        // Check sibling directory '../autonoma-frontend' relative to currentDir
        File sibling = new File(currentDir.getParentFile(), "autonoma-frontend");
        if (sibling.exists() && sibling.isDirectory()) {
            return sibling;
        }

        // Check if 'autonoma-frontend' is a subdirectory of currentDir (if started from workspace root)
        File subDir = new File(currentDir, "autonoma-frontend");
        if (subDir.exists() && subDir.isDirectory()) {
            return subDir;
        }

        // Check if inside Autonoma_ERP folder
        File erpDir = new File(currentDir, "Autonoma_ERP/autonoma-frontend");
        if (erpDir.exists() && erpDir.isDirectory()) {
            return erpDir;
        }

        // Search recursively up to 3 levels up for autonoma-frontend
        File search = currentDir;
        for (int i = 0; i < 3; i++) {
            if (search == null) break;
            File match = new File(search, "autonoma-frontend");
            if (match.exists() && match.isDirectory()) {
                return match;
            }
            // Also search inside sibling directory 'Autonoma_ERP'
            File matchERP = new File(search, "Autonoma_ERP/autonoma-frontend");
            if (matchERP.exists() && matchERP.isDirectory()) {
                return matchERP;
            }
            search = search.getParentFile();
        }

        throw new IOException("Could not automatically locate 'autonoma-frontend' directory relative to " + currentDir.getAbsolutePath());
    }

    private File resolveTargetStaticDirectory(String override) throws IOException {
        if (override != null && !override.trim().isEmpty()) {
            File customPath = new File(override.trim());
            customPath.mkdirs();
            return customPath.getAbsoluteFile();
        }

        // Locate autonoma-backend directory
        String userDirProp = System.getProperty("user.dir");
        File currentDir = new File(userDirProp).getAbsoluteFile();
        File backendDir = null;

        if ("autonoma-backend".equalsIgnoreCase(currentDir.getName())) {
            backendDir = currentDir;
        } else {
            // Find autonoma-backend in sibling or subdirectories
            File sibling = new File(currentDir.getParentFile(), "autonoma-backend");
            if (sibling.exists() && sibling.isDirectory()) {
                backendDir = sibling;
            } else {
                File subDir = new File(currentDir, "autonoma-backend");
                if (subDir.exists() && subDir.isDirectory()) {
                    backendDir = subDir;
                } else {
                    File erpDir = new File(currentDir, "Autonoma_ERP/autonoma-backend");
                    if (erpDir.exists() && erpDir.isDirectory()) {
                        backendDir = erpDir;
                    }
                }
            }
        }

        if (backendDir == null) {
            // If backend project dir cannot be found, fallback to src/main/resources/static under the current dir
            backendDir = currentDir;
        }

        File targetStatic = new File(backendDir, "src/main/resources/static");
        targetStatic.mkdirs();
        return targetStatic.getAbsoluteFile();
    }

    private boolean executeCommand(File workingDir, boolean isWindows, String... command) {
        try {
            List<String> fullCommand = new ArrayList<>();
            if (isWindows) {
                // On Windows, shell built-ins and npm executable need cmd /c
                fullCommand.add("cmd");
                fullCommand.add("/c");
            }
            fullCommand.addAll(List.of(command));

            ProcessBuilder pb = new ProcessBuilder(fullCommand);
            pb.directory(workingDir);
            pb.redirectErrorStream(true); // merge stderr into stdout

            Process process = pb.start();

            // Read command output in a separate thread or inline since we wait for it
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    log.info("[npm] {}", line);
                }
            }

            int exitCode = process.waitFor();
            if (exitCode != 0) {
                log.error("Command failed with exit code: {}", exitCode);
                return false;
            }
            return true;
        } catch (IOException e) {
            log.error("Process execution I/O error: {}", e.getMessage(), e);
            return false;
        } catch (InterruptedException e) {
            log.error("Process execution was interrupted: {}", e.getMessage(), e);
            Thread.currentThread().interrupt();
            return false;
        }
    }

    private void cleanDirectory(File dir) throws IOException {
        if (!dir.exists()) {
            return;
        }
        Files.walkFileTree(dir.toPath(), new SimpleFileVisitor<>() {
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                Files.delete(file);
                return FileVisitResult.CONTINUE;
            }

            @Override
            public FileVisitResult postVisitDirectory(Path dirPath, IOException exc) throws IOException {
                if (!dirPath.equals(dir.toPath())) {
                    Files.delete(dirPath);
                }
                return FileVisitResult.CONTINUE;
            }
        });
    }

    private void copyDirectory(Path source, Path target) throws IOException {
        Files.walkFileTree(source, new SimpleFileVisitor<>() {
            @Override
            public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                Path targetDir = target.resolve(source.relativize(dir));
                Files.createDirectories(targetDir);
                return FileVisitResult.CONTINUE;
            }

            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                Files.copy(file, target.resolve(source.relativize(file)), StandardCopyOption.REPLACE_EXISTING);
                return FileVisitResult.CONTINUE;
            }
        });
    }
}
