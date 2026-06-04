@echo off
rem Set Java home and path
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.7.6-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"
rem Run the Maven wrapper
call mvnw.cmd spring-boot:run
