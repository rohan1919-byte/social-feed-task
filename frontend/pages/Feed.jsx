import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  TextField,
  Avatar,
  Box,
  Paper,
} from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentIcon from "@mui/icons-material/Comment";
import LogoutIcon from "@mui/icons-material/Logout";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

function Feed() {
  const [text, setText] = useState("");
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [image, setImage] = useState(null);

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetchPosts();
  }, []);

  const createPost = async () => {
    if (!text.trim() && !image) {
      alert("Enter text or select image");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("text", text);

      if (image) {
        formData.append("image", image);
      }

      await API.post("/posts", formData, {
        headers: {
          authorization: localStorage.getItem("token"),
        },
      });

      setText("");
      setImage(null);

      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  const handleLike = async (id) => {
    try {
      await API.put(
        `/posts/${id}/like`,
        {},
        {
          headers: {
            authorization: localStorage.getItem("token"),
          },
        },
      );

      fetchPosts();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      console.log(err);
    }
  };

  const addComment = async (id) => {
   const comment = comments[id];

  if (!comment?.trim()) return;

    try {
      await API.post(
        `/posts/${id}/comment`,
        {
          comment: comment,
        },
        {
          headers: {
            authorization: localStorage.getItem("token"),
          },
        },
      );

      setComments({
  ...comments,
  [id]: "",
});
      fetchPosts();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      console.log(err);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
             Social Feed
          </Typography>

          <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper
          elevation={4}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Create Post
          </Typography>

          <TextField
            multiline
            rows={4}
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
          />

          <Box mt={2}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<AddPhotoAlternateIcon />}
            >
              Upload Image
              <input
                hidden
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </Button>

            {image && (
              <Typography sx={{ mt: 1 }} variant="body2">
                {image.name}
              </Typography>
            )}
          </Box>

          <Button variant="contained" sx={{ mt: 2 }} onClick={createPost}>
            Post
          </Button>
        </Paper>

        {posts.map((post) => (
          <Card
            key={post._id}
            sx={{
              mb: 3,
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar>{post.username?.charAt(0).toUpperCase()}</Avatar>

                <Typography variant="h6">{post.username}</Typography>
              </Box>

              <Typography variant="body1" mb={2}>
                {post.text}
              </Typography>

              {post.image && (
                <img
                  src={`https://social-feed-backend-6po4.onrender.com/uploads/`}
                  alt="post"
                  style={{
                    width: "100%",
                    maxHeight: "400px",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
              )}

              <Box mt={2} display="flex" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<FavoriteIcon />}
                  onClick={() => handleLike(post._id)}
                >
                  {post.likes.length}
                </Button>

                <Button variant="outlined" startIcon={<CommentIcon />}>
                  {post.comments.length}
                </Button>
              </Box>

              <Box mt={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Write a comment..."
                  value={comments[post._id] || ""}
                  onChange={(e) =>
                    setComments({
                      ...comments,
                      [post._id]: e.target.value,
                    })
                  }
                />

                <Button
                  variant="contained"
                  sx={{ mt: 1 }}
                  onClick={() => addComment(post._id)}
                >
                  Comment
                </Button>
              </Box>

              <Box mt={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Comments ({post.comments.length})
                </Typography>

                {post.comments.map((comment, index) => (
                  <Box
                    key={index}
                    sx={{
                      mt: 1,
                      p: 1,
                      background: "#f5f5f5",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2">
                      <strong>{comment.username}</strong>: {comment.comment}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Container>
    </>
  );
}

export default Feed;
