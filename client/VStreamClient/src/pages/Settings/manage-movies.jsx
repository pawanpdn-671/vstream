import MoviesListTabContent from "@/components/settings/movies-list";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/shared/tabs";
import React from "react";

const ManageMovies = () => {
	return (
		<div>
			<Tabs defaultValue="movies">
				<TabsList>
					<TabsTrigger value="movies">Movies</TabsTrigger>
					<TabsTrigger value="add-movie">Add Movie</TabsTrigger>
				</TabsList>
				<TabsContent value="movies">
					<MoviesListTabContent />
				</TabsContent>
				<TabsContent value="add-movie"></TabsContent>
			</Tabs>
		</div>
	);
};

export default ManageMovies;
