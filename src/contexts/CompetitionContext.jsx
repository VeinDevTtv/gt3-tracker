import React, { createContext, useContext, useState, useEffect } from 'react';
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
    // Simulating data fetch from localStorage
    try {
      const storedCompetitions = JSON.parse(localStorage.getItem('gt3_competitions') || '[]');
      const publicCompetitions = storedCompetitions.filter(comp => comp.isPublic === true);
      setCompetitions(publicCompetitions);
    } catch (error) {
      console.error("Error loading competitions:", error);
    }
    setLoading(false);
  }, []);

  // Fetch user's competitions when user is logged in
  useEffect(() => {
    if (!currentUser) {
      setUserCompetitions([]);
      return;
    }

    try {
      const storedCompetitions = JSON.parse(localStorage.getItem('gt3_competitions') || '[]');
      const userComps = storedCompetitions.filter(comp => 
        comp.participants && comp.participants.includes(currentUser.id)
      );
      setUserCompetitions(userComps);
    } catch (error) {
      console.error("Error loading user competitions:", error);
    }
  }, [currentUser]);

  // Create a new competition
  async function createCompetition(competitionData) {
    if (!currentUser) {
      toast.error("You must be logged in to create a competition");
      return null;
    }

    try {
      // Get existing competitions
      const storedCompetitions = JSON.parse(localStorage.getItem('gt3_competitions') || '[]');
      
      // Create new competition object
      const newCompetition = {
        id: Date.now().toString(),
        ...competitionData,
        createdBy: currentUser.id,
        creatorName: currentUser.username || "Anonymous",
        participants: [currentUser.id],
        createdAt: new Date().toISOString(),
        status: "active"
      };

      // Save to localStorage
      localStorage.setItem('gt3_competitions', JSON.stringify([...storedCompetitions, newCompetition]));
      
      // Update state with the new competition
      if (newCompetition.isPublic) {
        setCompetitions(prev => [...prev, newCompetition]);
      }
      setUserCompetitions(prev => [...prev, newCompetition]);
      
      toast.success("Competition created successfully!");
      return newCompetition.id;
    } catch (error) {
      console.error("Error creating competition:", error);
      toast.error("Failed to create competition");
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
      const storedCompetitions = JSON.parse(localStorage.getItem('gt3_competitions') || '[]');
      const competitionIndex = storedCompetitions.findIndex(comp => comp.id === competitionId);
      
      if (competitionIndex === -1) {
        toast.error("Competition not found");
        return false;
      }

      const competition = storedCompetitions[competitionIndex];
      
      if (competition.participants.includes(currentUser.id)) {
        toast.error("You are already participating in this competition");
        return false;
      }

      // Update the competition with the new participant
      storedCompetitions[competitionIndex] = {
        ...competition,
        participants: [...competition.participants, currentUser.id]
      };
      
      // Save back to localStorage
      localStorage.setItem('gt3_competitions', JSON.stringify(storedCompetitions));
      
      // Update state
      if (competition.isPublic) {
        setCompetitions(prevCompetitions => prevCompetitions.map(comp => 
          comp.id === competitionId 
            ? { ...comp, participants: [...comp.participants, currentUser.id] }
            : comp
        ));
      }
      
      setUserCompetitions(prev => [...prev, storedCompetitions[competitionIndex]]);
      
      toast.success("Joined competition successfully!");
      return true;
    } catch (error) {
      console.error("Error joining competition:", error);
      toast.error("Failed to join competition");
      return false;
    }
  }

  // Leave a competition
  async function leaveCompetition(competitionId) {
    if (!currentUser) return false;

    try {
      const storedCompetitions = JSON.parse(localStorage.getItem('gt3_competitions') || '[]');
      const competitionIndex = storedCompetitions.findIndex(comp => comp.id === competitionId);
      
      if (competitionIndex === -1) {
        toast.error("Competition not found");
        return false;
      }

      const competition = storedCompetitions[competitionIndex];
      
      if (!competition.participants.includes(currentUser.id)) {
        toast.error("You are not participating in this competition");
        return false;
      }

      // If user is the creator, don't allow leaving unless they're the only participant
      if (competition.createdBy === currentUser.id && competition.participants.length > 1) {
        toast.error("As the creator, you cannot leave a competition with other participants. Transfer ownership first.");
        return false;
      }

      // If user is the last participant and the creator, delete the competition
      if (competition.participants.length === 1 && competition.createdBy === currentUser.id) {
        const updatedCompetitions = storedCompetitions.filter(comp => comp.id !== competitionId);
        localStorage.setItem('gt3_competitions', JSON.stringify(updatedCompetitions));
        
        // Update state
        setCompetitions(prev => prev.filter(comp => comp.id !== competitionId));
        setUserCompetitions(prev => prev.filter(comp => comp.id !== competitionId));
        
        toast.success("Competition deleted as you were the last participant");
        return true;
      }

      // Otherwise, just remove the user from participants
      const updatedParticipants = competition.participants.filter(id => id !== currentUser.id);
      storedCompetitions[competitionIndex] = {
        ...competition,
        participants: updatedParticipants
      };
      
      localStorage.setItem('gt3_competitions', JSON.stringify(storedCompetitions));
      
      // Update state
      if (competition.isPublic) {
        setCompetitions(prev => prev.map(comp => 
          comp.id === competitionId 
            ? { ...comp, participants: updatedParticipants }
            : comp
        ));
      }
      
      setUserCompetitions(prev => prev.filter(comp => comp.id !== competitionId));
      
      toast.success("Left competition successfully");
      return true;
    } catch (error) {
      console.error("Error leaving competition:", error);
      toast.error("Failed to leave competition");
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
      const allCompetitions = [...competitions, ...userCompetitions];
      const competition = allCompetitions.find(c => c.id === competitionId);
      
      if (!competition) {
        toast.error("Competition not found");
        return [];
      }

      // Get all users and filter for participants
      const users = JSON.parse(localStorage.getItem('gt3_users') || '[]');
      const participantsData = users
        .filter(user => competition.participants.includes(user.id))
        .map(user => {
          // Don't include sensitive information
          const { password, ...safeUserData } = user;
          return safeUserData;
        });

      // Get user data for calculations (in a real app, this would come from a database)
      // For now, we'll generate mock data
      const enhancedParticipantsData = participantsData.map(user => ({
        ...user,
        totalSaved: Math.floor(Math.random() * 150000),
        target: 280000,
        weeks: Array.from({ length: 10 }, () => ({
          profit: Math.floor(Math.random() * 5000)
        }))
      }));

      // Sort based on competition type
      const sortedData = enhancedParticipantsData.sort((a, b) => {
        switch(competition.type) {
          case "total-savings":
            return b.totalSaved - a.totalSaved;
          case "weekly-gain":
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

  // Update a user's position on the leaderboard
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