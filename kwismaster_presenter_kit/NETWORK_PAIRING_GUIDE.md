# Network Pairing Guide for Scorekeeper

This guide explains how to connect the **Display Station** (presenting laptop) with the **Entry Station** (correction laptop) so they can share scores in real-time during your quiz event.

## What You Need

- 2 laptops (Display Station and Entry Station)
- 1 USB stick (for transferring files between laptops)
- Both laptops should be on the same local network (WiFi or Ethernet)

## IMPORTANT: Keep Pages Open During Quiz Events

**⚠️ DO NOT REFRESH the scorekeeper page while connected or during pairing!**

- Refreshing the page will disconnect the network sync
- You will need to re-pair the devices using the full pairing process again
- The browser will warn you if you try to refresh while connected
- During pairing, you'll see yellow warning boxes reminding you not to refresh

**Best Practice:** Once paired, keep both scorekeeper pages open for the entire quiz event.

## Overview

The pairing process uses **2 files** to establish a secure connection:

1. **scorekeeper.pair** - Created by the Display Station
2. **scorekeeper.pair2** - Created by the Entry Station in response

You transfer these files using a USB stick (no internet required!).

---

## Step-by-Step Instructions

### Step 1: Start on the Display Station (Presenting Laptop)

1. Open the scorekeeper on the **Display Station** laptop
2. Click **"Setup Network Sync"**
3. Click **"Display Mode"** (📺 Display Mode button)
4. **⚠️ You'll see a yellow warning box - DO NOT refresh during pairing!**
5. Click **"Download Pairing File"**
6. The file `scorekeeper.pair` will be downloaded to your Downloads folder

### Step 2: Transfer to Entry Station

1. **Copy the file to USB stick:**
   - Find `scorekeeper.pair` in your Downloads folder
   - Copy it to a USB stick

2. **Plug USB stick into Entry Station:**
   - Remove the USB stick from Display Station
   - Plug it into the **Entry Station** laptop

### Step 3: Process on Entry Station (Correction Laptop)

1. Open the scorekeeper on the **Entry Station** laptop
2. Click **"Setup Network Sync"**
3. Click **"Entry Mode"** (✏️ Entry Mode button)
4. **⚠️ You'll see a yellow warning box - DO NOT refresh during pairing!**
5. Click **"Upload Pairing File"**
6. Select the `scorekeeper.pair` file from your USB stick
7. Wait a moment for processing...
8. **⚠️ Another yellow warning appears - Keep this page open!**
9. Click **"Download Response File"**
10. The file `scorekeeper.pair2` will be downloaded to your Downloads folder

### Step 4: Transfer Back to Display Station

1. **Copy the response file to USB stick:**
   - Find `scorekeeper.pair2` in your Downloads folder
   - Copy it to the USB stick (you can delete the old .pair file if you want)

2. **Plug USB stick back into Display Station:**
   - Remove the USB stick from Entry Station
   - Plug it back into the **Display Station** laptop

### Step 5: Complete Connection on Display Station

1. On the **Display Station**, you should still have the pairing dialog open
2. Click **"Upload Response File (.pair2)"**
3. Select the `scorekeeper.pair2` file from your USB stick
4. Wait a moment...
5. You should see "Connected" indicator appear!

---

## Troubleshooting

### "Connection failed" or "Not connected"

- **Check network:** Make sure both laptops are on the same WiFi or connected to the same network
- **Restart the process:** Click "Disconnect" and start over from Step 1
- **Check files:** Make sure you're uploading the correct files (.pair on Entry, .pair2 on Display)

### "No pairing data available"

- You need to click "Download Pairing File" or "Download Response File" first
- If you closed the dialog, click "Setup Network Sync" again and start over

### Files not downloading

- **Check your browser:** Make sure downloads are enabled
- **Check Downloads folder:** The files might be there already
- **Try again:** Close the dialog and restart the pairing process

### USB stick not recognized

- **Wait a moment:** Sometimes USB sticks take a few seconds to appear
- **Try different port:** Plug the USB stick into a different USB port
- **Check the stick:** Make sure the USB stick works and isn't full

### Taking too long

- **Be patient:** The system allows up to 10 minutes for file transfers
- **Don't close the browser:** Keep the scorekeeper page open while transferring files
- **Don't click "Cancel":** Wait for the process to complete

---

## Tips for Success

✓ **Keep pages open:** Don't close the browser, refresh, or navigate away during pairing or while connected

✓ **Browser will warn you:** If you try to refresh while connected, your browser will show a warning dialog

✓ **Use the same USB stick:** This makes it easier to find your files

✓ **Label your laptops:** Put a sticky note on each laptop (Display/Entry) so you don't mix them up

✓ **Test before the event:** Do a practice run the day before your quiz event

✓ **Take your time:** There's no rush - the system will wait for you

---

## What Happens After Connection?

Once connected:

- **Entry Station:** Enter scores here during the quiz
- **Display Station:** Shows updated scores automatically
- **Both laptops:** Can see real-time score updates

The connection stays active until:
- You click "Disconnect"
- You close the browser
- You refresh the page (⚠️ Don't do this during the quiz!)
- You restart the laptop
- Network connection is lost

**If you accidentally refresh or lose connection:** Just repeat the pairing process from Step 1. Your teams and scores are saved locally and won't be lost.

---

## Still Having Problems?

If nothing works:
1. Close both browsers completely
2. Restart both laptops
3. Make sure both are on the same network
4. Try the pairing process again from Step 1

The pairing files (.pair and .pair2) are only valid for one pairing session. If something goes wrong, you need to generate new files by starting over.
