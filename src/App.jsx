import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";

import { listPosts } from "./graphql/queries";
import { createPost, updatePost } from "./graphql/mutations";

import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

const client = generateClient();

function App() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [user, setUser] = useState(null);

  const { signOut } = useAuthenticator();

  useEffect(() => {
    fetchPosts();
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const fetchPosts = async () => {
    try {
      const result = await client.graphql({
        query: listPosts,
        authMode: "apiKey", // 👈 force API_KEY for public read
      });
      setPosts(result.data.listPosts.items);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  // ✅ Create a post (must be logged in)
  const addPost = async () => {
    if (!form.title || !form.content) return;
    try {
      await client.graphql({
        query: createPost,
        variables: { input: { ...form } },
      });
      setForm({ title: "", content: "" });
      fetchPosts();
    } catch (err) {
      alert("You must be signed in to create a post!");
    }
  };

  // ✅ Update a post (only owner can update)
  const editPost = async (post) => {
    const newTitle = prompt("Enter new title", post.title);
    if (!newTitle) return;

    try {
      await client.graphql({
        query: updatePost,
        variables: { input: { id: post.id, title: newTitle } },
      });
      fetchPosts();
    } catch (err) {
      alert("You are not the owner of this post!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Posts
          </h1>
          {user && (
            <button
              onClick={signOut}
              className="px-6 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 rounded-full hover:bg-white hover:shadow-md transition-all duration-200 font-medium"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Create Post (only if logged in) */}
        {user && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Create New Post
            </h2>
            <div className="space-y-4">
              <input
                placeholder="Enter your title..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full p-4 bg-white/70 backdrop-blur-sm border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all duration-200 placeholder-gray-500"
              />
              <textarea
                placeholder="Share your thoughts..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full p-4 bg-white/70 backdrop-blur-sm border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all duration-200 placeholder-gray-500 h-32 resize-none"
              />
              <button
                onClick={addPost}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Publish Post
              </button>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        <div className="space-y-6">
          {posts.map((post, index) => (
            <div
              key={post.id}
              className="group bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl hover:bg-white/80 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                  {post.title}
                </h2>
                {user?.username === post.owner && (
                  <button
                    onClick={() => editPost(post)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-cyan-400  transition-all duration-200 shadow-md rounded  "
                  >
                    Edit
                  </button>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed mb-4 text-lg">
                {post.content}
              </p>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {(post.owner || "A").charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {post.owner || "Anonymous"}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-500">Just now</span>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-500">
              Be the first to share something amazing!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Main() {
  return (
    <Authenticator>
      <App />
    </Authenticator>
  );
}
