# QR Code Embedding and Title Support - Feature Summary

The PDF generator module has been enhanced to support **actual QR code embedding** and **PDF titles**, while maintaining all existing functionality.

## ✅ **New Features Implemented**

### **1. Real QR Code Embedding**
- **Actual QR codes** embedded in PDF (not just placeholders)
- Uses `qrcode` npm package for high-quality QR generation
- **Automatic fallback** to placeholders if qrcode package not available
- **High resolution** QR codes for better scanning

### **2. PDF Title Support**
- **Optional title** displayed at top of PDF
- **Centered formatting** with professional styling
- **Automatic spacing** - content area adjusts when title is present
- **Bold font** with underline for clear hierarchy

### **3. Enhanced QR Code Data**
Each QR code object now supports a `data` field:
```javascript
{
  id: "wifi",
  label: "WiFi Password", 
  data: "WIFI:T:WPA;S:HotelGuest;P:password123;H:false;;"
}
```

## 🎯 **QR Code Data Types Supported**

| Type | Example Data | Use Case |
|------|-------------|----------|
| **URL** | `https://example.com` | Websites, menus, booking |
| **WiFi** | `WIFI:T:WPA;S:NetworkName;P:Password;;` | Guest WiFi access |
| **Email** | `mailto:contact@hotel.com` | Contact information |
| **Phone** | `tel:+1-555-123-4567` | Direct calling |
| **SMS** | `sms:+1-555-123-4567` | Text messaging |
| **Plain Text** | `Any text content` | Instructions, codes |

## 📋 **Updated Configuration**

### **New Parameters**
```javascript
{
  title: "Hotel Room 101 - QR Codes",  // Optional PDF title
  qrCodes: [
    {
      id: "wifi",
      label: "WiFi Access",
      data: "WIFI:T:WPA;S:HotelGuest;P:SecurePass123;;"  // NEW: QR data
    }
  ]
}
```

### **Backward Compatibility**
- **All existing code continues to work unchanged**
- QR codes without `data` field show placeholders
- All existing parameters and options preserved

## 🛠️ **Updated TypeScript Support**

```typescript
interface QRCodeData {
  id: string;
  label: string;
  data?: string; // NEW: QR code data to encode
}

interface PDFConfig {
  title?: string; // NEW: Optional PDF title
  qrCodes?: QRCodeData[];
  // ... all existing properties
}
```

## 🌟 **Usage Examples**

### **Hotel Room QR Codes**
```javascript
const hotelConfig = {
  paperSize: "A4",
  title: "Hotel Room 205 - Service Codes",
  qrCodeCount: 4,
  qrCodesPerRow: 2,
  qrCodes: [
    { 
      id: "wifi", 
      label: "WiFi Access", 
      data: "WIFI:T:WPA;S:HotelGuest;P:SecurePass123;;" 
    },
    { 
      id: "menu", 
      label: "Digital Menu", 
      data: "https://hotel.com/menu" 
    },
    { 
      id: "concierge", 
      label: "Concierge Service", 
      data: "https://hotel.com/concierge" 
    },
    { 
      id: "checkout", 
      label: "Express Check-out", 
      data: "https://hotel.com/checkout/205" 
    }
  ]
};

const result = await generateSinglePDF(hotelConfig, {
  type: 'file',
  path: 'room-pdfs',
  name: 'room-205-qr-codes.pdf'
});
```

### **Restaurant Menu QR Codes**
```javascript
const restaurantConfig = {
  title: "Restaurant QR Menu",
  qrCodeCount: 3,
  qrCodesPerRow: 3,
  qrCodes: [
    { id: "menu", label: "Full Menu", data: "https://restaurant.com/menu" },
    { id: "specials", label: "Daily Specials", data: "https://restaurant.com/specials" },
    { id: "feedback", label: "Leave Review", data: "https://restaurant.com/review" }
  ]
};
```

### **Office Equipment QR Codes**
```javascript
const officeConfig = {
  title: "Office Equipment - Quick Access",
  qrCodeCount: 6,
  qrCodesPerRow: 3,
  qrCodeSize: "small",
  qrCodes: [
    { id: "printer", label: "Printer Manual", data: "https://office.com/printer-guide" },
    { id: "wifi", label: "Guest WiFi", data: "WIFI:T:WPA;S:OfficeGuest;P:Welcome2024;;" },
    { id: "support", label: "IT Support", data: "mailto:support@office.com" },
    { id: "booking", label: "Room Booking", data: "https://office.com/book-room" },
    { id: "emergency", label: "Emergency", data: "tel:+1-555-911-0000" },
    { id: "directory", label: "Staff Directory", data: "https://office.com/directory" }
  ]
};
```

## 🔄 **Web API Integration**

### **Express.js Example**
```javascript
app.post('/api/generate-qr-pdf', async (req, res) => {
  const result = await generateSinglePDF(req.body, { type: 'blob' });
  
  if (result.success) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="qr-codes.pdf"');
    res.send(result.data);
  } else {
    res.status(500).json({ error: result.error });
  }
});
```

## 📦 **Dependencies**

### **Required**
- `pdfkit` - PDF generation (already included)

### **Optional but Recommended**
- `qrcode` - Real QR code generation
  ```bash
  npm install qrcode
  ```
  
**Note:** Without qrcode package, placeholders are used automatically.

## ✅ **Tested Features**

All functionality has been thoroughly tested:

- ✅ **Real QR code embedding** with various data types
- ✅ **PDF title support** with proper formatting
- ✅ **Multiple output formats** (file, blob)
- ✅ **Backward compatibility** with existing code
- ✅ **Error handling** and graceful fallbacks
- ✅ **TypeScript declarations** updated
- ✅ **Professional layouts** with proper spacing

## 🎯 **Perfect For**

- **Hotels**: Room service codes, WiFi access, digital menus
- **Restaurants**: Menu QR codes, feedback forms, ordering
- **Offices**: Equipment manuals, WiFi guest access, contact info
- **Events**: Check-in codes, program links, contact details
- **Retail**: Product information, reviews, support contacts

The module now provides **professional QR code PDF generation** with real, scannable QR codes and beautiful formatting! 🎉