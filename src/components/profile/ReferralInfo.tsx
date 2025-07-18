import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReferral } from '@/hooks/useReferral';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Copy, Users, Gift, Trophy, UserPlus } from 'lucide-react';

interface ReferralInfoProps {
  userId: string;
}

export const ReferralInfo = ({ userId }: ReferralInfoProps) => {
  const { getUserReferralCode, getReferralStats } = useReferral();
  const [referralStats, setReferralStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [referredBy, setReferredBy] = useState<any>(null);

  useEffect(() => {
    loadReferralData();
  }, [userId]);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      
      // Get referral stats
      const stats = await getReferralStats();
      setReferralStats(stats);

      // Get who referred this user
      const { data: profile } = await supabase
        .from('profiles')
        .select('referred_by')
        .eq('id', userId)
        .single();

      if (profile?.referred_by) {
        const { data: referrer } = await supabase
          .from('profiles')
          .select('id, full_name, username')
          .eq('id', profile.referred_by)
          .single();
        
        setReferredBy(referrer);
      }
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    const code = getUserReferralCode();
    if (code) {
      try {
        await navigator.clipboard.writeText(code);
        toast.success('Referral code copied to clipboard! 📋');
      } catch (error) {
        toast.error('Failed to copy referral code');
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Referral Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Your Referral Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-500" />
            Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/20 px-4 py-2 rounded-lg">
                <code className="text-lg font-mono font-bold text-purple-700 dark:text-purple-300">
                  {getUserReferralCode() || 'Loading...'}
                </code>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={copyReferralCode}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this code with friends to invite them to Everwo! 🚀
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Referral Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Referral Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-lg font-semibold">
                  {referralStats?.referralCount || 0}
                </span>
                <span className="text-sm text-muted-foreground">people referred</span>
              </div>
            </div>

            {referralStats?.referrals && referralStats.referrals.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recent Referrals:</h4>
                <div className="space-y-2">
                  {referralStats.referrals.slice(0, 5).map((referral: any) => (
                    <div key={referral.id} className="flex items-center gap-2 text-sm">
                      <UserPlus className="h-4 w-4 text-green-500" />
                      <span>{referral.referred_user.full_name || referral.referred_user.username}</span>
                      <Badge variant="secondary" className="text-xs">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Who Referred You */}
      {referredBy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-500" />
              Referred By
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                <span className="font-medium text-green-700 dark:text-green-300">
                  {referredBy.username || 'unknown-user'}
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                Your Inviter
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 