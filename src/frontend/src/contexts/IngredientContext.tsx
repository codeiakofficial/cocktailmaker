import * as React from 'react';
import type { IIngredient, IngredientContextType } from './Ingredient';

export const IngredientContext = React.createContext<IngredientContextType | null>(null);

const API_URL = 'http://localhost:8080/api';

const IngredientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ingredients, setIngredients] = React.useState<IIngredient[]>([]);

    // Fetch ingredients from backend
    const fetchIngredients = React.useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/ingredient`);
            if (!response.ok) throw new Error('Failed to fetch ingredients');
            const data = await response.json();
            setIngredients(data);
        } catch (err) {
            console.error(err instanceof Error ? err.message : 'Unknown error');
        }
    }, []);

    // Fetch ingredients on mount
    React.useEffect(() => {
        fetchIngredients();
    }, [fetchIngredients]);

    const value: IngredientContextType = {
        ingredients
    };

    return (
        <IngredientContext.Provider value={value}>
            {children}
        </IngredientContext.Provider>
    );
};

// Hook to use the context
export const useIngredients = () => {
    const context = React.useContext(IngredientContext);
    if (!context) {
        throw new Error('useIngredients must be used within IngredientProvider');
    }
    return context;
};

export default IngredientProvider;