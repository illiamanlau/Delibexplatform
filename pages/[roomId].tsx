// pages/[roomId].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ChatRoom from '../components/ChatRoom';

// Define chat room configurations
const chatRooms = {
  chat1: { title: "Chat Room 1", description: "Welcome to the first chat room!" },
  chat2: { title: "Chat Room 2", description: "This is the second chat room." },
  // Add more chat rooms as needed
};

export default function DynamicChatRoom() {
  const router = useRouter();
  const { roomId } = router.query;
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Retrieve user info from localStorage
    const storedName = localStorage.getItem('userName');
    const storedEmail = localStorage.getItem('userEmail');
    if (storedName && storedEmail) {
      setUserName(storedName);
      setUserEmail(storedEmail);
    } else {
      // Redirect to login if user info is not found
      router.push('/');
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!roomId || typeof roomId !== 'string' || !chatRooms[roomId as keyof typeof chatRooms]) {
    return <div>Invalid chat room. RoomId: "{roomId}", User: "{userName}", Email: "{userEmail}"</div>;
  }

  const { title, description } = chatRooms[roomId as keyof typeof chatRooms];

  return (
    <ChatRoom
      roomId={roomId}
      title={title}
      description={description}
      userName={userName}
      userEmail={userEmail}
    />
  );
}