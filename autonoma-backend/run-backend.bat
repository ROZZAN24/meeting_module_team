@echo off
rem Set Java home and path
set "JAVA_HOME=C:\Program Files\Java\jdk-25"
set "PATH=%JAVA_HOME%\bin;%PATH%"
rem Run the Maven wrapper
call mvnw.cmd spring-boot:run
