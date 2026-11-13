# Brightdesk Workspace printing integration

Workspace uses the canonical dependency-free Brightdesk Printing adapter snapshot. The Electron main process owns sender-authorized IPC for queue listing, network discovery, user-selected WSD pairing, printer capabilities, OS settings and print submission. Renderer access is limited to the context-isolated preload API.

The native build script runs after the Rust Node-API module. macOS builds the Bonjour/IPP helper as a universal Apple Silicon and Intel executable; Windows builds the IPP/WSD helper using Visual Studio C++ Build Tools and Windows SDK; Linux uses host CUPS `ippfind` for network discovery. Installer configuration unpacks the printer helpers and Rust module outside ASAR.

Print submission uses the visible OS print dialog. Brightdesk does not silently create queues, pair devices, install drivers or upload document contents. Submission acceptance does not confirm a physical page was printed. Virtual-printer tests are not physical printer verification.
