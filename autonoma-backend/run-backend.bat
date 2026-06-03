@echo off
rem Set Java home and path
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"
rem Run the Maven wrapper
call mvnw.cmd spring-boot:run
