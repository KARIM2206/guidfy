import os
import subprocess

def run():
    print("Running Validator...")
    subprocess.run(["python", "../engine/validator.py"], cwd=os.path.dirname(__file__))
    
    print("\nRunning Unit Tests...")
    subprocess.run(["python", "-m", "unittest", "discover", "-s", "."], cwd=os.path.dirname(__file__))
    
    print("\nRunning 100 User Simulation...")
    subprocess.run(["python", "simulate_users.py"], cwd=os.path.dirname(__file__))

if __name__ == "__main__":
    run()
