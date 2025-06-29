import { createClient } from "@supabase/supabase-js";
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";

const router = new Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function authMiddleware(req, res, next) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    req.user = session.user;
    next();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

router.post("/posts", authMiddleware, async (req, res) => {
  try {
    if (!req.body) {
      res.status(404).json({ message: "Не хватает полей в пост запросе" });

      return;
    }
    const body = req.body;

    const { data: post, error } = await supabase
      .from("Blog")
      .insert([body])
      .select();
    console.log(error, "ERROR");
    res.status(200).json(post);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
router.get("/posts", authMiddleware, async (req, res) => {
  const { range = 9, nonGlobal } = req.query;

  try {
    if (nonGlobal === "true") {
      const { data: subscriptions, error } = await supabase
        .from("Subscriptions")
        .select("*");

      if (error) {
        res.status(500).json(error);
        throw error;
      }
      const subscribedOnOwner = subscriptions.filter((subscriptions) => {
        return subscriptions.subscribers !== null
          ? subscriptions.subscribers.some((elem) => elem.userId == req.user.id)
          : false;
      });
      const ownerUserIds = subscribedOnOwner.map((sub) => sub.owner.userId);

      const { data: Blog, error: withOwnersError } = await supabase
        .from("Blog")
        .select("*")
        .in("authorId", ownerUserIds) // Фильтрация по автору из списка подписок
        .range(0, range ? range : 9);

      if (withOwnersError) {
        res.status(500).json(withOwnersError);
        throw withOwnersError;
      }
      res.status(200).send(Blog);
    } else {
      const { data: Blog, error } = await supabase
        .from("Blog")
        .select("*")
        .range(0, range ? range : 9);
      if (error) throw error; // Обработка ошибки для запроса к Blog
      res.status(200).send(Blog);
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e.message }); // Отправляем сообщение об ошибке
  }
});

router.get("/posts/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: post, error } = await supabase
      .from("Blog")
      .select("*")
      .eq("id", id)
      .single();
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.status(200).json(post);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/posts/comments/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const currentUser = req.user;

    // 1. Валидация
    if (!content?.trim()) {
      return res.status(400).json({ error: "Comment content cannot be empty" });
    }

    // 2. Подготовка комментария
    const newComment = {
      id: uuidv4(),
      userId: currentUser.id,
      authorFirstName: currentUser.user_metadata?.first_name || "Anonymous",
      authorLastName: currentUser.user_metadata?.last_name || "",
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    // 3. Атомарное обновление
    const { data: post, error: fetchError } = await supabase
      .from("Blog")
      .select("comments")
      .eq("id", postId)
      .single();

    if (fetchError || !post) {
      console.error("Post not found:", { postId, error: fetchError });
      return res.status(404).json({ error: "Post not found" });
    }

    // 4. Обновление массива
    const updatedComments = [...(post.comments || []), newComment];
    const { error: updateError } = await supabase
      .from("Blog")
      .update({
        comments: updatedComments,
      })
      .eq("id", postId)
      .select();

    if (updateError) {
      console.error("Update failed:", { postId, error: updateError });
      throw updateError;
    }

    // 5. Получение обновлённых данных
    const { data: updatedPost } = await supabase
      .from("Blog")
      .select("*")
      .eq("id", postId)
      .single();

    return res.status(200).json({
      updatedPost,
    });
  } catch (error) {
    console.error("Final error:", {
      params: req.params,
      error: error.message,
      code: error.code,
    });

    return res.status(500).json({
      error: "Failed to add comment",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
});

router.put("/posts/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isPrivate, tags } = req.body;
    const userId = req.user?.id; // Получаем ID пользователя из authMiddleware

    // 1. Валидация входных данных
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    // 2. Проверяем существование поста
    const { data: existingPost, error: findError } = await supabase
      .from("Blog")
      .select("*")
      .eq("id", id)
      .single();

    if (findError) throw findError;
    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    const updates = {
      title,
      content,
      isPrivate: isPrivate,
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
    };

    // 5. Выполняем обновление
    const { data: updatedPost, error: updateError } = await supabase
      .from("Blog")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 6. Возвращаем обновленный пост
    res.status(200).json(updatedPost);
  } catch (e) {
    console.error("Error updating post:", e);
    res.status(500).json({
      error: e instanceof Error ? e.message : "Internal server error",
    });
  }
});
router.delete("/posts/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params; // Получаем ID из URL параметров

    // 1. Проверяем авторизацию пользователя
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;
    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // 2. Проверяем существование поста
    const { data: post, error: findError } = await supabase
      .from("Blog")
      .select("*")
      .eq("id", id)
      .single();

    if (findError) throw findError;
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // 3. Проверяем права доступа (либо автор, либо админ)
    const isAuthor = post.authorId === session.user.id;
    const isAdmin = session.user.user_metadata?.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        error: "Forbidden: You can only delete your own posts",
      });
    }

    // 4. Удаляем пост
    const { error: deleteError } = await supabase
      .from("Blog")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    // 5. Возвращаем успешный ответ
    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      deletedPostId: id,
    });
  } catch (e) {
    console.error("Error deleting post:", e);
    res.status(500).json({
      error: e instanceof Error ? e.message : "Internal server error",
    });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // 1. Регистрация пользователя в Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          // Метаданные пользователя
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (authError) throw authError;
    if (authData.confirmation_sent_at !== "")
      res.status(500).json({
        error:
          "На почту было отправлено письмо, после подтверждения следует перейти на страницу логина",
      });

    // 2. Сохранение профиля в отдельной таблице (если нужно)
    if (authData.user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: authData.user.id,
          email: authData.user.email,
          first_name: firstName,
          last_name: lastName,
          created_at: new Date().toISOString(),
        },
      ]);

      if (profileError) throw profileError;
    }
    console.log("authData", authData);
    res.status(200).json(authData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// Вход
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    res.status(200).json(data);
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
});

// Получение текущей сессии
router.get("/session", async (req, res) => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Выход
router.post("/logout", async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    res.status(200).json({ message: "Logged out successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Защищенные маршруты (пример)
router.get("/protected", async (req, res) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    res.status(200).json({ message: "Protected data", user: session.user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/subscriptions/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Ищем все записи, где owner.userId соответствует переданному ID
    const { data: subscriptions, error } = await supabase
      .from("Subscriptions")
      .select("*")
      .eq("owner->>userId", id);

    if (error) {
      console.error("Error fetching subscriptions:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res
        .status(200)
        .json({ message: "No subscriptions found for this user" });
    }

    // Возвращаем найденные подписки
    return res.status(200).json(subscriptions);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/subscriptions", authMiddleware, async (req, res) => {
  const { owner, subscriber } = req.body;

  // Проверяем, что текущий пользователь - это подписчик
  if (req.user.id !== subscriber.userId) {
    return res
      .status(403)
      .json({ error: "You can only subscribe as yourself" });
  }

  try {
    // 1. Находим запись owner в таблице Subscriptions
    const { data: existingRecords, error: findError } = await supabase
      .from("Subscriptions")
      .select("*")
      .eq("owner->>userId", owner.userId);

    if (findError) {
      console.error("Error finding subscription:", findError);
      return res.status(500).json({ error: findError.message });
    }

    // Если запись существует
    if (existingRecords && existingRecords.length > 0) {
      const existingSubscription = existingRecords[0];
      const currentSubscribers = existingSubscription.subscribers || [];
      // Проверяем, не подписан ли уже этот пользователь
      const isAlreadySubscribed = currentSubscribers.some(
        (sub) => sub.userId === subscriber.userId
      );

      if (isAlreadySubscribed) {
        return res.status(400).json({ error: "Already subscribed" });
      }

      // Создаем новый массив подписчиков
      const newSubscribers = [...currentSubscribers, subscriber];
      // Обновляем запись в базе данных
      const { data: updatedSubscription, error: updateError } = await supabase
        .from("Subscriptions")
        .update({
          subscribers: newSubscribers,
        })
        .eq("owner->>userId", owner.userId) // Используем userId из owner
        .select("*");

      if (updateError) {
        console.error("Error updating subscription:", updateError);
        return res.status(500).json({ error: updateError.message });
      }

      return res.status(200).json(updatedSubscription[0]);
    } else {
      const { data: newSubscription, error: createError } = await supabase
        .from("Subscriptions")
        .insert({
          owner: owner,
          subscribers: [subscriber],
        })
        .select();

      if (createError) {
        console.error("Error creating subscription:", createError);
        return res.status(500).json({ error: createError.message });
      }

      return res.status(200).json(newSubscription[0]);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
router.delete("/subscriptions", authMiddleware, async (req, res) => {
  const { owner, subscriber } = req.body;

  // Проверяем, что текущий пользователь - это подписчик
  // if (req.user.id !== subscriber.userId) {
  //   return res.status(403).json({ error: "You can only unsubscribe yourself" });
  // }

  try {
    // 1. Находим запись owner в таблице Subscriptions
    const { data: existingRecords, error: findError } = await supabase
      .from("Subscriptions")
      .select("*")
      .eq("owner->>userId", owner.userId);

    if (findError) {
      console.error("Error finding subscription:", findError);
      return res.status(500).json({ error: findError.message });
    }

    // Если запись не существует
    if (!existingRecords || existingRecords.length === 0) {
      return res.status(404).json({ error: "Subscription record not found" });
    }

    const existingSubscription = existingRecords[0];

    // Проверяем, подписан ли пользователь
    const subscriberIndex = existingSubscription.subscribers?.findIndex(
      (sub) => sub.userId === subscriber.userId
    );

    if (subscriberIndex === -1) {
      return res.status(400).json({ error: "Not subscribed" });
    }

    const updatedSubscribers = [
      ...existingSubscription.subscribers.slice(0, subscriberIndex),
      ...existingSubscription.subscribers.slice(subscriberIndex + 1),
    ];

    // Обновляем запись в базе данных
    const { data: updatedSubscription, error: updateError } = await supabase
      .from("Subscriptions")
      .update({
        subscribers: updatedSubscribers.length > 0 ? updatedSubscribers : null,
      })
      .eq("id", existingSubscription.id)
      .select();

    if (updateError) {
      console.error("Error updating subscription:", updateError);
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({
      message: "Unsubscribed successfully",
      subscription: updatedSubscription[0],
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
