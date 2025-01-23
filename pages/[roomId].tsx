import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ChatRoom from '../components/ChatRoom';

// Default fallback configuration in case the API fails
const fallbackChatRooms = {
  test: { title: "Test Chatroom", description: "Welcome to the test chatroom!" },
};

export default function DynamicChatRoom() {
  const router = useRouter();
  const { roomId } = router.query;

  const [chatRooms, setChatRooms] = useState(fallbackChatRooms);
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
      return;
    }

    // Fetch the room configurations from the API
    const fetchChatRooms = async () => {
      try {
        const response = await fetch('/api/rooms');
        if (!response.ok) {
          throw new Error(`Failed to fetch rooms: ${response.statusText}`);
        }

        const rooms = await response.json();
        setChatRooms(rooms);
      } catch (error) {
        console.error('Failed to fetch chat rooms:', error);
        setChatRooms(fallbackChatRooms); // Use fallback if API fails
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatRooms();
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!roomId || typeof roomId !== 'string' || !chatRooms[roomId]) {
    console.log('Available chatRooms:', chatRooms);
    console.log('Provided roomId:', roomId);

    return (
      <div>
        Invalid chat room. RoomId: "{roomId}", User: "{userName}", Email: "{userEmail}"
      </div>
    );
  }

  const { title, description } = chatRooms[roomId];

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
