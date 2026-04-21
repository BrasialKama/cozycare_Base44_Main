import { useLocation, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Home, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <div className="max-w-md w-full">
                <div className="text-center space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-7xl font-display font-light text-primary/30">404</h1>
                        <div className="h-0.5 w-16 bg-primary/20 mx-auto"></div>
                    </div>
                    
                    <div className="space-y-3">
                        <h2 className="text-2xl font-display font-semibold text-foreground">
                            Stranica nije pronađena
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Stranica <span className="font-medium text-foreground">"{pageName}"</span> ne postoji ili je uklonjena.
                        </p>
                    </div>
                    
                    {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
                        <div className="mt-8 p-4 bg-muted rounded-xl border border-border">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div className="text-left space-y-1">
                                    <p className="text-sm font-medium text-foreground">Napomena za administratora</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Moguće je da ova stranica još nije implementirana. Zatražite izradu u chatu.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="pt-6">
                        <Link to="/">
                            <Button variant="outline" className="rounded-xl">
                                <Home className="w-4 h-4 mr-2" />
                                Povratak na početnu
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}