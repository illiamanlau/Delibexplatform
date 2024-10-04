// pages/[roomId].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ChatRoom from '../components/ChatRoom';

// Define chat room configurations
const chatRooms = {
  test: { title: "Test Chatroom", description: "Welcome to the test chatroom!" },
  groupA: { title: "Social media group 1", description: "Group A" },
  groupB: { title: "Social media group 1", description: "Group B" },
  groupC: { title: "Social media group 2", description: "Group C" },
  groupD: { title: "Social media group 2", description: "Group D" },
  groupE: { title: "Social media group 3", description: "Group E" },
  groupF: { title: "Social media group 3", description: "Group F" },
  groupG: { title: "Social media group 4", description: "Group G" },
  groupH: { title: "Social media group 4", description: "Group H" },
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