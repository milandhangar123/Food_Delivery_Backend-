# 🔧 Fix Your .env File

Your `.env` file exists but might have formatting issues. Here's how to fix it:

## ⚠️ Current Issue

Your `.env` file has spaces around `=` and quotes, which can cause parsing issues:
```
PORT = 9000                    ❌ Wrong (spaces)
MONGO_URI = "value"            ❌ Wrong (spaces + quotes)
```

## ✅ Correct Format

The `.env` file should have NO spaces around `=` and NO quotes (unless the value itself needs quotes):
```
PORT=9000                      ✅ Correct
MONGO_URI=mongodb+srv://...    ✅ Correct
JWT_SECRET=your_secret_here    ✅ Correct
```

## 🚀 Quick Fix

1. **Open** `Food_Delivery_Backend-/.env` in a text editor

2. **Replace the content** with this (remove spaces and quotes):

```env
PORT=9000
NODE_ENV=development
MONGO_URI=mongodb+srv://ms8755301254:Milan786@cluster0.y7o2r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=63106432d55b3a42df88cbce52aca0982651050f8991a27d695c5dbf55692463
FRONTEND_URL=http://localhost:5173
```

3. **Save** the file

4. **Restart** your server:
   ```bash
   npm start
   ```

## 🔐 Security Note

The JWT_SECRET above is auto-generated and secure. Your old one ("gaurav raj") was too weak - please use the new one!

## ✅ Test

After fixing, your server should start without errors:
```bash
✅ Database connected successfully
Food app is listening on port 9000!
```

---

**Still having issues?** Make sure:
- No spaces around `=`
- No quotes around values
- Each variable on its own line
- No empty lines with just spaces

