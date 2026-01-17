"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare,
  Send,
  Loader2,
  Search,
  Package,
  ArrowLeft,
  User,
  Check,
  CheckCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Create a new conversation for a listing
  const createConversationForListing = useCallback(async (listingId, recipientId) => {
    try {
      console.log("Creating conversation for listing:", listingId, "with recipient:", recipientId);
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId, listingId }),
      });
      
      const data = await response.json();
      console.log("Conversation creation response:", data);
      
      if (data.success) {
        toast.success("Conversation started!");
        
        // Re-fetch to get enriched data
        const refreshResponse = await fetch("/api/conversations");
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setConversations(refreshData.conversations);
          const enrichedConv = refreshData.conversations.find(c => c._id === data.conversation._id);
          if (enrichedConv) {
            setSelectedConversation(enrichedConv);
          } else {
            // Fallback - use basic data
            setSelectedConversation({
              ...data.conversation,
              listing: null,
              otherParticipant: { id: recipientId, name: "User" },
              lastMessage: null,
              unreadCount: 0,
            });
          }
        }
        return data.conversation;
      } else {
        toast.error(data.error || "Failed to start conversation");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to start conversation");
    }
    return null;
  }, []);

  // Fetch conversations
  useEffect(() => {
    async function fetchConversations() {
      if (!session?.user?.id) return;

      try {
        const response = await fetch("/api/conversations");
        const data = await response.json();

        if (data.success) {
          setConversations(data.conversations);

          // Check for listingId in query params to auto-select or create conversation
          const listingId = searchParams.get("listingId");
          const sellerId = searchParams.get("sellerId");
          const recipientId = searchParams.get("recipientId");
          const targetRecipient = sellerId || recipientId;
          
          if (listingId) {
            const conv = data.conversations.find(
              (c) => c.listingId === listingId
            );
            if (conv) {
              setSelectedConversation(conv);
            } else if (targetRecipient && targetRecipient !== session.user.id) {
              // No existing conversation - create one (but not with yourself)
              await createConversationForListing(listingId, targetRecipient);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchConversations();
    }
  }, [session, status, searchParams, createConversationForListing]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    async function fetchMessages() {
      if (!selectedConversation) return;

      setLoadingMessages(true);

      try {
        const response = await fetch(
          `/api/conversations/${selectedConversation._id}`
        );
        const data = await response.json();

        if (data.success) {
          setMessages(data.messages);
          // Update unread count in local state
          setConversations((prev) =>
            prev.map((c) =>
              c._id === selectedConversation._id ? { ...c, unreadCount: 0 } : c
            )
          );
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      } finally {
        setLoadingMessages(false);
      }
    }

    fetchMessages();
  }, [selectedConversation]);

  // Poll for new messages
  useEffect(() => {
    if (!selectedConversation) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/conversations/${selectedConversation._id}`
        );
        const data = await response.json();
        if (data.success) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [selectedConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);

    try {
      const response = await fetch(
        `/api/conversations/${selectedConversation._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newMessage }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
        textareaRef.current?.focus();

        // Update conversation in list
        setConversations((prev) =>
          prev.map((c) =>
            c._id === selectedConversation._id
              ? { ...c, lastMessage: data.message, updatedAt: new Date() }
              : c
          )
        );
      } else {
        toast.error(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.otherParticipant?.name?.toLowerCase().includes(query) ||
      conv.listing?.title?.toLowerCase().includes(query)
    );
  });

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div className="h-[calc(100vh-12rem)]">
      <Card className="h-full">
        <div className="flex h-full">
          {/* Conversations List */}
          <div
            className={cn(
              "w-full md:w-80 lg:w-96 border-r flex flex-col",
              selectedConversation && "hidden md:flex"
            )}
          >
            <div className="p-4 border-b space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages
                  {totalUnread > 0 && (
                    <Badge variant="default">{totalUnread}</Badge>
                  )}
                </h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-1">No messages yet</h3>
                  <p className="text-sm text-muted-foreground">
                    When you message a seller or receive inquiries, they&apos;ll
                    appear here
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv._id}
                      onClick={() => setSelectedConversation(conv)}
                      className={cn(
                        "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                        selectedConversation?._id === conv._id && "bg-muted"
                      )}
                    >
                      <div className="flex gap-3">
                        {/* Avatar or Listing Image */}
                        <div className="relative flex-shrink-0">
                          {conv.listing?.images?.[0]?.url ? (
                            <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                              <Image
                                src={conv.listing.images[0].url}
                                alt={conv.listing.title}
                                width={48}
                                height={48}                                sizes="48px"                                className="object-cover w-full h-full"
                              />
                            </div>
                          ) : (
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>
                                {conv.otherParticipant?.name?.charAt(0)?.toUpperCase() ||
                                  "U"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          {conv.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                              <span className="text-xs text-primary-foreground font-medium">
                                {conv.unreadCount}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-medium truncate">
                                {conv.otherParticipant?.name || "Unknown User"}
                              </span>
                              {conv.otherParticipant?.role && (
                                <Badge
                                  variant={conv.otherParticipant.role === "Seller" ? "default" : "secondary"}
                                  className={cn(
                                    "text-[10px] px-1.5 py-0 h-4 flex-shrink-0",
                                    conv.otherParticipant.role === "Seller"
                                      ? "bg-blue-600 hover:bg-blue-600"
                                      : "bg-green-600 hover:bg-green-600 text-white"
                                  )}
                                >
                                  {conv.otherParticipant.role}
                                </Badge>
                              )}
                            </div>
                            {conv.lastMessage && (
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {formatDistanceToNow(
                                  new Date(conv.lastMessage.createdAt),
                                  { addSuffix: true }
                                )}
                              </span>
                            )}
                          </div>
                          {conv.listing && (
                            <p className="text-xs text-primary truncate">
                              {conv.listing.title}
                            </p>
                          )}
                          {conv.lastMessage && (
                            <p
                              className={cn(
                                "text-sm truncate mt-1",
                                conv.unreadCount > 0
                                  ? "text-foreground font-medium"
                                  : "text-muted-foreground"
                              )}
                            >
                              {conv.lastMessage.senderId === session?.user?.id && (
                                <span className="text-muted-foreground">You: </span>
                              )}
                              {conv.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Messages Area */}
          <div
            className={cn(
              "flex-1 flex flex-col",
              !selectedConversation && "hidden md:flex"
            )}
          >
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>

                  {selectedConversation.listing?.images?.[0]?.url ? (
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={selectedConversation.listing.images[0].url}
                        alt={selectedConversation.listing.title}
                        width={40}
                        height={40}
                        sizes="40px"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {selectedConversation.otherParticipant?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">
                        {selectedConversation.otherParticipant?.name}
                      </h3>
                      {selectedConversation.otherParticipant?.role && (
                        <Badge
                          variant={selectedConversation.otherParticipant.role === "Seller" ? "default" : "secondary"}
                          className={cn(
                            "text-xs",
                            selectedConversation.otherParticipant.role === "Seller"
                              ? "bg-blue-600 hover:bg-blue-600"
                              : "bg-green-600 hover:bg-green-600 text-white"
                          )}
                        >
                          {selectedConversation.otherParticipant.role}
                        </Badge>
                      )}
                    </div>
                    {selectedConversation.listing && (
                      <Link
                        href={`/listings/${selectedConversation.listingId}`}
                        className="text-sm text-primary hover:underline truncate block"
                      >
                        {selectedConversation.listing.title}
                      </Link>
                    )}
                  </div>

                  {selectedConversation.listing && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/listings/${selectedConversation.listingId}`}>
                        <Package className="h-4 w-4 mr-2" />
                        View Listing
                      </Link>
                    </Button>
                  )}
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence initial={false}>
                        {messages.map((message) => {
                          const isOwn = message.senderId === session?.user?.id;

                          return (
                            <motion.div
                              key={message._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={cn(
                                "flex",
                                isOwn ? "justify-end" : "justify-start"
                              )}
                            >
                              <div
                                className={cn(
                                  "max-w-[80%] rounded-2xl px-4 py-2",
                                  isOwn
                                    ? "bg-primary text-primary-foreground rounded-br-md"
                                    : "bg-muted rounded-bl-md"
                                )}
                              >
                                <p className="whitespace-pre-wrap break-words">
                                  {message.content}
                                </p>
                                <div
                                  className={cn(
                                    "flex items-center justify-end gap-1 mt-1",
                                    isOwn
                                      ? "text-primary-foreground/70"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  <span className="text-xs">
                                    {formatDistanceToNow(
                                      new Date(message.createdAt),
                                      { addSuffix: true }
                                    )}
                                  </span>
                                  {isOwn && (
                                    message.read ? (
                                      <CheckCheck className="h-3 w-3" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Textarea
                      ref={textareaRef}
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="min-h-[44px] max-h-32 resize-none"
                      rows={1}
                    />
                    <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessageSquare className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
                <p className="text-muted-foreground max-w-sm">
                  Select a conversation to view messages or contact a seller
                  from a listing page to start a new conversation.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
