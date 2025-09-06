Set WshShell = CreateObject("WScript.Shell")
Set oUrlLink = WshShell.CreateShortcut("Inventory Manager.url")
oUrlLink.TargetPath = "http://localhost:3000"
oUrlLink.Save
