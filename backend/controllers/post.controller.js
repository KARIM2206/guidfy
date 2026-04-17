const prisma = require('../prismaClient');

// ─── GET POST ─────────────────────────
exports.getPostById = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, title: true },
        },
        community: {
          select: { id: true, name: true, slug: true, icon: true },
        },
        _count: { select: { comments: true } },
      },
    });

    if (!post) return res.status(404).json({ message: "Post not found" });


    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET COMMENTS ─────────────────────
exports.getPostComments = async (req, res) => {
  try {
    const comments = await prisma.postComment.findMany({
      where: { postId: parseInt(req.params.id) },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, title: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({ success: true, data: comments });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── ADD COMMENT ──────────────────────
exports.createComment = async (req, res) => {
  const { body, parentId } = req.body;

  if (!body?.trim()) {
    return res.status(400).json({ message: "Comment body is required" });
  }

  try {
    const comment = await prisma.postComment.create({
      data: {
        body: body.trim(),
        postId: parseInt(req.params.id),
        authorId: req.user.id,
        parentId: parentId ? parseInt(parentId) : null,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, title: true },
        },
      },
    });

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── DELETE COMMENT ───────────────────
exports.deleteComment = async (req, res) => {
  try {
    const comment = await prisma.postComment.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.authorId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.postComment.delete({
      where: { id: comment.id },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};