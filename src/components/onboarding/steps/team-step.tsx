'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Users, X, Plus, AlertCircle, Mail } from 'lucide-react';

interface TeamMember {
  email: string;
  role: string;
}

interface TeamData {
  invites: TeamMember[];
}

interface OnboardingTeamStepProps {
  data: TeamData;
  updateData: (data: Partial<TeamData>) => void;
}

export function OnboardingTeamStep({ data, updateData }: OnboardingTeamStepProps) {
  const [invites, setInvites] = useState<TeamMember[]>(data.invites || []);
  const [newInvite, setNewInvite] = useState<TeamMember>({ email: '', role: 'member' });
  const [error, setError] = useState<string | null>(null);

  // Role options
  const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'member', label: 'Team Member' },
    { value: 'viewer', label: 'Viewer (Read-only)' }
  ];

  // Validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle adding a new team member
  const handleAddInvite = () => {
    // Validate email
    if (!newInvite.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(newInvite.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Check for duplicate email
    if (invites.some(invite => invite.email.toLowerCase() === newInvite.email.toLowerCase())) {
      setError('This email has already been added');
      return;
    }

    // Add new invite
    const updatedInvites = [...invites, newInvite];
    setInvites(updatedInvites);
    updateData({ invites: updatedInvites });

    // Reset form
    setNewInvite({ email: '', role: 'member' });
    setError(null);
  };

  // Handle removing a team member
  const handleRemoveInvite = (index: number) => {
    const updatedInvites = invites.filter((_, i) => i !== index);
    setInvites(updatedInvites);
    updateData({ invites: updatedInvites });
  };

  // Handle input change
  const handleInputChange = (field: keyof TeamMember, value: string) => {
    setNewInvite(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when typing
    if (field === 'email' && error) {
      setError(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center p-6 bg-primary/5 rounded-lg mb-6">
        <Users className="h-12 w-12 text-primary" />
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Invite team members to collaborate with you on ClimaBill. They'll receive an email invitation to join your organization.
        </p>

        <div className="space-y-4 mt-4">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-7">
                <Label htmlFor="email" className="sr-only">Email</Label>
                <Input
                  id="email"
                  placeholder="Email address"
                  type="email"
                  value={newInvite.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div className="col-span-3">
                <Label htmlFor="role" className="sr-only">Role</Label>
                <Select
                  value={newInvite.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Button 
                  onClick={handleAddInvite} 
                  className="w-full"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          {invites.length > 0 ? (
            <div className="space-y-2 mt-4">
              <Label>Team Members to Invite</Label>
              {invites.map((invite, index) => (
                <Card key={index} className="border border-border">
                  <CardContent className="p-3 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{invite.email}</span>
                      <Badge role={invite.role} />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveInvite(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-muted p-4 rounded-lg text-center mt-4">
              <p className="text-sm text-muted-foreground">
                No team members added yet
              </p>
            </div>
          )}
        </div>

        <Alert variant="info" className="bg-blue-50 text-blue-800 border-blue-200 mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You can skip this step and invite team members later from the Team section.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

// Badge component for roles
function Badge({ role }: { role: string }) {
  let bgColor = 'bg-gray-100 text-gray-800';
  
  switch (role) {
    case 'admin':
      bgColor = 'bg-purple-100 text-purple-800';
      break;
    case 'manager':
      bgColor = 'bg-blue-100 text-blue-800';
      break;
    case 'member':
      bgColor = 'bg-green-100 text-green-800';
      break;
    case 'viewer':
      bgColor = 'bg-yellow-100 text-yellow-800';
      break;
  }

  const roleLabels: Record<string, string> = {
    admin: 'Administrator',
    manager: 'Manager',
    member: 'Team Member',
    viewer: 'Viewer'
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${bgColor}`}>
      {roleLabels[role] || role}
    </span>
  );
}
