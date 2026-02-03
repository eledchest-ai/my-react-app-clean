# React + TypeScript + Supabase Blog App
## Live Demo
- https://eledchest-ai.github.io/my-react-app-clean/


A simple full-stack blog application built with **React**, **TypeScript**, and **Supabase** (Auth, Postgres, Storage).
Users can register/login/logout, create posts with images, comment with images, and only the post owner can edit/delete.

## Live Features
- ✅ Register / Login / Logout (Supabase Auth)
- ✅ CRUD Posts (Create, List, View, Edit, Delete)
- ✅ Post Image Upload (Supabase Storage)
- ✅ Comments (per post) + optional image upload
- ✅ Pagination on blog list
- ✅ Owner-only edit/delete (Supabase Row Level Security)

## Tech Stack
- **Frontend:** React + TypeScript + Vite
- **Routing:** react-router-dom
- **Backend:** Supabase
  - Auth (email/password)
  - Database (Postgres tables: `posts`, `comments`)
  - Storage buckets (`post-images`, `comment-images`)
  - Row Level Security (RLS) policies for ownership

## Project Structure
```txt
src/
  lib/
    supabase.ts            # Supabase client
  components/
    ImageUpload.tsx        # Uploads image to Supabase Storage and returns public URL
  pages/
    BlogList.tsx           # List posts + pagination
    CreateBlog.tsx         # Create post (requires login)
    ViewBlog.tsx           # View post + comments + delete (owner only)
    EditBlog.tsx           # Edit post (owner only)
    Login.tsx              # Login
    Register.tsx           # Register
    Logout.tsx             # Logout
  App.tsx                  # Routes + navigation
  main.tsx                 # App bootstrap (BrowserRouter)
