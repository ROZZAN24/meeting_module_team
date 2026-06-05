import sys

try:
    import pymssql
    print("pymssql imported successfully")
except ImportError:
    print("pymssql NOT installed")

try:
    import pyodbc
    print("pyodbc imported successfully")
except ImportError:
    print("pyodbc NOT installed")
