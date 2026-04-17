import subprocess
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import time
import os

class ReloadServerHandler(FileSystemEventHandler):
    def __init__(self, command):
        self.command = command
        self.process = subprocess.Popen(command, shell=True)

    def on_any_event(self, event):
        # راقب أي تعديل على ملفات .py
        if event.src_path.endswith(".py"):
            print(f"\n⚡ Detected change in {event.src_path}, restarting server…")
            self.process.kill()
            self.process = subprocess.Popen(self.command, shell=True)

if __name__ == "__main__":
    path_to_watch = os.getcwd()  # راقب كل الملفات في المشروع
    command_to_run = "python predict.py"  # الأمر اللي يشغل السيرفر

    event_handler = ReloadServerHandler(command_to_run)
    observer = Observer()
    observer.schedule(event_handler, path_to_watch, recursive=True)
    observer.start()

    print("🚀 Watching for changes… Press Ctrl+C to stop.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        event_handler.process.kill()
    observer.join()