import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Trophy, Users, Plus, CalendarDays, TrendingUp, Target } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Mock data for competitions
const mockCompetitions = [
  {
    id: 1,
    name: "GT3 Racing League",
    description: "Who can reach their Porsche GT3 savings goal first?",
    members: 24,
    startDate: "2023-06-15",
    endDate: "2023-12-31",
    target: 280000,
    creator: "michael_s",
    participants: [
      { name: "michael_s", progress: 75, amount: 210000 },
      { name: "sarah_j", progress: 68, amount: 190400 },
      { name: "david_m", progress: 61, amount: 170800 },
      { name: "lisa_p", progress: 54, amount: 151200 },
      { name: "john_d", progress: 49, amount: 137200 },
    ]
  },
  {
    id: 2,
    name: "Supercar Savers",
    description: "Community challenge for luxury car enthusiasts",
    members: 18,
    startDate: "2023-08-01",
    endDate: "2024-08-01",
    target: 350000,
    creator: "alex_w",
    participants: [
      { name: "alex_w", progress: 40, amount: 140000 },
      { name: "jessica_r", progress: 32, amount: 112000 },
      { name: "robert_k", progress: 29, amount: 101500 },
      { name: "emma_t", progress: 25, amount: 87500 },
      { name: "james_h", progress: 22, amount: 77000 },
    ]
  },
  {
    id: 3,
    name: "Porsche Enthusiasts",
    description: "For those dedicated to owning a Porsche",
    members: 12,
    startDate: "2023-09-01",
    endDate: "2024-09-01",
    target: 250000,
    creator: "chris_p",
    participants: [
      { name: "chris_p", progress: 60, amount: 150000 },
      { name: "laura_n", progress: 55, amount: 137500 },
      { name: "kevin_g", progress: 42, amount: 105000 },
      { name: "angela_m", progress: 38, amount: 95000 },
      { name: "brian_f", progress: 30, amount: 75000 },
    ]
  }
];

// User's competitions - mock data
const myCompetitions = [
  mockCompetitions[0], 
  mockCompetitions[2]
];

const LeaderboardsPanel = ({ theme, totalProfit, target, username = "current_user" }) => {
  const [activeTab, setActiveTab] = useState("discover");
  const [viewCompetition, setViewCompetition] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCompetition, setNewCompetition] = useState({
    name: "",
    description: "",
    target: target,
    endDate: ""
  });

  const handleCreateCompetition = () => {
    if (!newCompetition.name || !newCompetition.description || !newCompetition.endDate) {
      toast.error("Please fill out all required fields");
      return;
    }

    // Mock creating a new competition
    const createdCompetition = {
      id: mockCompetitions.length + 1,
      name: newCompetition.name,
      description: newCompetition.description,
      members: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: newCompetition.endDate,
      target: newCompetition.target || target,
      creator: username,
      participants: [
        { name: username, progress: Math.round((totalProfit / target) * 100), amount: totalProfit }
      ]
    };

    toast.success("Competition created successfully!");
    setShowCreateDialog(false);
    
    // Reset form
    setNewCompetition({
      name: "",
      description: "",
      target: target,
      endDate: ""
    });
    
    // In a real app, we would save this to a database and refresh the list
    console.log("Created competition:", createdCompetition);
  };

  const handleJoinCompetition = (competition) => {
    // Mock joining a competition
    toast.success(`Joined "${competition.name}" competition!`);
    // In a real app, we would add the user to the competition in the database
  };

  return (
    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary-color" />
          Community Leaderboards
        </CardTitle>
        <CardDescription>
          Compete with others and track your progress
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs 
          defaultValue="discover" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="my-competitions">My Competitions</TabsTrigger>
            </TabsList>

            <Button 
              size="sm" 
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-1"
            >
              <Plus size={16} />
              Create
            </Button>
          </div>

          <TabsContent value="discover" className="space-y-4">
            {viewCompetition ? (
              <CompetitionDetail 
                competition={viewCompetition} 
                onBack={() => setViewCompetition(null)}
                onJoin={handleJoinCompetition}
                username={username}
                theme={theme}
              />
            ) : (
              <div className="grid gap-4">
                {mockCompetitions.map(competition => (
                  <CompetitionCard 
                    key={competition.id}
                    competition={competition} 
                    onClick={() => setViewCompetition(competition)}
                    theme={theme}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-competitions" className="space-y-4">
            {viewCompetition ? (
              <CompetitionDetail 
                competition={viewCompetition} 
                onBack={() => setViewCompetition(null)}
                isMember={true}
                username={username}
                theme={theme}
              />
            ) : myCompetitions.length > 0 ? (
              <div className="grid gap-4">
                {myCompetitions.map(competition => (
                  <CompetitionCard 
                    key={competition.id}
                    competition={competition} 
                    onClick={() => setViewCompetition(competition)}
                    isMember={true}
                    theme={theme}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Competitions Joined</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  You haven't joined any competitions yet.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("discover")}
                >
                  Discover Competitions
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className={theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : ''}>
            <DialogHeader>
              <DialogTitle>Create New Competition</DialogTitle>
              <DialogDescription className={theme === 'dark' ? 'text-gray-300' : ''}>
                Create a competition to challenge friends and track savings progress together.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="comp-name">Competition Name</Label>
                <Input 
                  id="comp-name" 
                  value={newCompetition.name}
                  onChange={(e) => setNewCompetition({...newCompetition, name: e.target.value})}
                  className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comp-desc">Description</Label>
                <Input 
                  id="comp-desc" 
                  value={newCompetition.description}
                  onChange={(e) => setNewCompetition({...newCompetition, description: e.target.value})}
                  className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comp-target">Target Amount ($)</Label>
                <Input 
                  id="comp-target" 
                  type="number"
                  value={newCompetition.target}
                  onChange={(e) => setNewCompetition({...newCompetition, target: parseFloat(e.target.value) || target})}
                  className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Default is your personal savings target.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comp-end-date">End Date</Label>
                <Input 
                  id="comp-end-date"
                  type="date"
                  value={newCompetition.endDate}
                  onChange={(e) => setNewCompetition({...newCompetition, endDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCompetition}>
                Create Competition
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// Competition Card Component
const CompetitionCard = ({ competition, onClick, isMember = false, theme }) => {
  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer hover:border-primary-color transition-colors ${
        theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-lg flex items-center gap-2">
          {competition.name}
          {isMember && (
            <span className="bg-primary-color/20 text-primary-color text-xs py-1 px-2 rounded-full">
              Joined
            </span>
          )}
        </h3>
        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <Users size={14} />
          <span>{competition.members}</span>
        </div>
      </div>
      
      <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        {competition.description}
      </p>
      
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <CalendarDays size={14} />
          <span>Ends: {competition.endDate}</span>
        </div>
        <div className="flex items-center gap-1">
          <Target size={14} />
          <span>${competition.target.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// Competition Detail Component
const CompetitionDetail = ({ competition, onBack, onJoin, isMember = false, username, theme }) => {
  // Check if current user is already a participant
  const isParticipant = competition.participants.some(p => p.name === username) || isMember;

  // Get the top participants for the leaderboard
  const sortedParticipants = [...competition.participants].sort((a, b) => b.progress - a.progress);

  // Get the user's position if they're a participant
  const userPosition = isParticipant 
    ? sortedParticipants.findIndex(p => p.name === username) + 1 
    : null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          Back
        </Button>
        <h2 className="text-xl font-semibold">{competition.name}</h2>
      </div>

      <div className="grid gap-6">
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <h3 className="font-medium mb-2">Competition Details</h3>
          <p className="text-sm mb-3">{competition.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Created by</p>
              <p>{competition.creator}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Members</p>
              <p>{competition.members}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Target Amount</p>
              <p>${competition.target.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">End Date</p>
              <p>{competition.endDate}</p>
            </div>
          </div>

          {!isParticipant && (
            <Button 
              className="w-full mt-4"
              onClick={() => onJoin(competition)}
            >
              Join Competition
            </Button>
          )}

          {isParticipant && userPosition && (
            <div className={`mt-4 p-3 rounded-md ${
              theme === 'dark' 
                ? userPosition <= 3 ? 'bg-primary-color/20' : 'bg-gray-600/50' 
                : userPosition <= 3 ? 'bg-primary-color/10' : 'bg-gray-100'
            }`}>
              <p className="text-sm font-medium">
                Your Position: <span className="text-primary-color font-bold">#{userPosition}</span>
                {userPosition <= 3 && " 🏆"}
              </p>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary-color" />
            Leaderboard
          </h3>
          
          <div className="space-y-2">
            {sortedParticipants.map((participant, index) => (
              <div 
                key={participant.name}
                className={`flex items-center justify-between p-3 rounded-md ${
                  participant.name === username 
                    ? theme === 'dark' ? 'bg-primary-color/20' : 'bg-primary-color/10'
                    : theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    index < 3 
                      ? 'bg-primary-color text-white' 
                      : theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-800'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://avatar.vercel.sh/${participant.name}`} alt={participant.name} />
                      <AvatarFallback>{participant.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className={participant.name === username ? "font-medium" : ""}>{participant.name}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium">${participant.amount.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{participant.progress}% of target</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardsPanel; 