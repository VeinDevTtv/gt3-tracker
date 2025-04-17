import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const CompetitionContext = createContext();

export function useCompetition() {
  return useContext(CompetitionContext);
}

export function CompetitionProvider({ children }) {
  const { currentUser } = useAuth();
  const [competitions, setCompetitions] = useState([]);
  const [userCompetitions, setUserCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboards, setLeaderboards] = useState({});

  // Fetch all public competitions
  useEffect(() => {
    const q = query(
      collection(db, "competitions"),
      where("isPublic", "==", true),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const competitionList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCompetitions(competitionList);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Fetch user's competitions when user is logged in
  useEffect(() => {
    if (!currentUser) {
      setUserCompetitions([]);
      return;
    }

    const q = query(
      collection(db, "competitions"),
      where("participants", "array-contains", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userCompList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserCompetitions(userCompList);
    });

    return unsubscribe;
  }, [currentUser]);

  // Create a new competition
  async function createCompetition(competitionData) {
    if (!currentUser) {
      toast.error("You must be logged in to create a competition");
      return null;
    }

    try {
      const newCompetition = {
        ...competitionData,
        createdBy: currentUser.uid,
        creatorName: currentUser.displayName || "Anonymous",
        participants: [currentUser.uid],
        createdAt: new Date().toISOString(),
        status: "active"
      };

      const docRef = await addDoc(collection(db, "competitions"), newCompetition);
      toast.success("Competition created successfully!");
      return docRef.id;
    } catch (error) {
      toast.error("Failed to create competition: " + error.message);
      return null;
    }
  }

  // Join a competition
  async function joinCompetition(competitionId) {
    if (!currentUser) {
      toast.error("You must be logged in to join a competition");
      return false;
    }

    try {
      const competitionRef = doc(db, "competitions", competitionId);
      const competition = competitions.find(c => c.id === competitionId) || 
                        userCompetitions.find(c => c.id === competitionId);
      
      if (!competition) {
        toast.error("Competition not found");
        return false;
      }

      if (competition.participants.includes(currentUser.uid)) {
        toast.error("You are already participating in this competition");
        return false;
      }

      await updateDoc(competitionRef, {
        participants: [...competition.participants, currentUser.uid]
      });
      
      toast.success("Joined competition successfully!");
      return true;
    } catch (error) {
      toast.error("Failed to join competition: " + error.message);
      return false;
    }
  }

  // Leave a competition
  async function leaveCompetition(competitionId) {
    if (!currentUser) return false;

    try {
      const competitionRef = doc(db, "competitions", competitionId);
      const competition = userCompetitions.find(c => c.id === competitionId);
      
      if (!competition) {
        toast.error("Competition not found");
        return false;
      }

      if (!competition.participants.includes(currentUser.uid)) {
        toast.error("You are not participating in this competition");
        return false;
      }

      // If user is the creator, don't allow leaving unless they're the only participant
      if (competition.createdBy === currentUser.uid && competition.participants.length > 1) {
        toast.error("As the creator, you cannot leave a competition with other participants. Transfer ownership first.");
        return false;
      }

      // If user is the last participant and the creator, delete the competition
      if (competition.participants.length === 1 && competition.createdBy === currentUser.uid) {
        await deleteDoc(competitionRef);
        toast.success("Competition deleted as you were the last participant");
        return true;
      }

      // Otherwise, just remove the user from participants
      const updatedParticipants = competition.participants.filter(
        id => id !== currentUser.uid
      );
      
      await updateDoc(competitionRef, {
        participants: updatedParticipants
      });
      
      toast.success("Left competition successfully");
      return true;
    } catch (error) {
      toast.error("Failed to leave competition: " + error.message);
      return false;
    }
  }

  // Get leaderboard for a specific competition
  async function getLeaderboard(competitionId) {
    try {
      // If we already have this leaderboard cached and it's recent, return it
      if (leaderboards[competitionId] && 
          (new Date() - leaderboards[competitionId].timestamp) < 5 * 60 * 1000) {
        return leaderboards[competitionId].data;
      }

      // Get the competition to check its type and rules
      const competition = competitions.find(c => c.id === competitionId) || 
                          userCompetitions.find(c => c.id === competitionId);
      
      if (!competition) {
        toast.error("Competition not found");
        return [];
      }

      // Get all participants' data
      const q = query(
        collection(db, "userData"),
        where("uid", "in", competition.participants)
      );

      const querySnapshot = await getDocs(q);
      const participantsData = querySnapshot.docs.map(doc => ({
        userId: doc.id,
        ...doc.data()
      }));

      // Sort based on competition type (savings, weekly goal achieved, etc.)
      const sortedData = participantsData.sort((a, b) => {
        switch(competition.type) {
          case "total-savings":
            return b.totalSaved - a.totalSaved;
          case "weekly-gain":
            // Assuming each user has a weeks array
            const aLatestWeek = a.weeks?.slice(-1)[0]?.profit || 0;
            const bLatestWeek = b.weeks?.slice(-1)[0]?.profit || 0;
            return bLatestWeek - aLatestWeek;
          case "progress-percentage":
            const aPercentage = (a.totalSaved / a.target) * 100 || 0;
            const bPercentage = (b.totalSaved / b.target) * 100 || 0;
            return bPercentage - aPercentage;
          default:
            return b.totalSaved - a.totalSaved;
        }
      });

      // Save to cache
      setLeaderboards({
        ...leaderboards,
        [competitionId]: {
          data: sortedData,
          timestamp: new Date()
        }
      });

      return sortedData;
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast.error("Failed to load leaderboard");
      return [];
    }
  }

  // Update a user's position on the leaderboard (typically after they update their progress)
  async function updateLeaderboardPosition(competitionId) {
    // This will force a refresh of the leaderboard data
    if (leaderboards[competitionId]) {
      const updatedLeaderboards = { ...leaderboards };
      delete updatedLeaderboards[competitionId];
      setLeaderboards(updatedLeaderboards);
    }
    return await getLeaderboard(competitionId);
  }

  const value = {
    competitions,
    userCompetitions,
    loading,
    createCompetition,
    joinCompetition,
    leaveCompetition,
    getLeaderboard,
    updateLeaderboardPosition
  };

  return (
    <CompetitionContext.Provider value={value}>
      {children}
    </CompetitionContext.Provider>
  );
} 