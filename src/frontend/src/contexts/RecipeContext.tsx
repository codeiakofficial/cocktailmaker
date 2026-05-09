import * as React from 'react';
import type { RecipeContextType, IRecipe } from './Recipe';

export const RecipeContext = React.createContext<RecipeContextType | null>(null);

const API_URL = 'http://localhost:8080/api';

const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = React.useState<IRecipe[]>([]);

  // Fetch recipes from backend
  const fetchRecipes = React.useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/recipe`);
      if (!response.ok) throw new Error('Failed to fetch recipes');
      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  // Fetch recipes on mount
  React.useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Save recipe to backend
  const saveRecipe = React.useCallback(async (recipe: IRecipe) => {
    try {
      const response = await fetch(`${API_URL}/recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe),
      });
      if (!response.ok) throw new Error('Failed to save recipe');
      const savedRecipe = await response.json();
      setRecipes([...recipes, savedRecipe]);
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [recipes]);

  // Update recipe
  const updateRecipe = React.useCallback(async (id: number, recipe: IRecipe) => {
    try {
      const response = await fetch(`${API_URL}/recipe/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe),
      });
      if (!response.ok) throw new Error('Failed to update recipe');
      setRecipes(recipes.map(r => r.id === id ? recipe : r));
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [recipes]);

  // Delete recipe
  const deleteRecipe = React.useCallback(async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/recipe/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete recipe');
      setRecipes(recipes.filter(r => r.id !== id));
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [recipes]);

  const value: RecipeContextType = {
    recipes,
    saveRecipe,
    updateRecipe,
    deleteRecipe,
  };

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
};

// Hook to use the context
export const useRecipes = () => {
  const context = React.useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within RecipeProvider');
  }
  return context;
};

export default RecipeProvider;
