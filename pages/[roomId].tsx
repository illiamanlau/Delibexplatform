// pages/[roomId].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ChatRoom from '../components/ChatRoom';

// Define chat room configurations
const chatRooms = {
  test: { title: "Test Chatroom", description: "Welcome to the test chatroom!" },
  room1A: { title: "Social media experiment 1", description: "Group A" },
  room1B: { title: "Social media experiment 1", description: "Group B" },
  room2A: { title: "Social media experiment 2", description: "Group C" },
  room2B: { title: "Social media experiment 2", description: "Group D" },
  room3A: { title: "Social media experiment 3", description: "Group E" },
  room3B: { title: "Social media experiment 3", description: "Group F" },
  room4A: { title: "Social media experiment 4", description: "Group G" },
  room4B: { title: "Social media experiment 4", description: "Group H" },
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