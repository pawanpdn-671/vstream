import AddMovieInterface from "@/components/settings/add-movie-interface";
import MoviesListTabContent from "@/components/settings/movies-list";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/shared/tabs";
import React from "react";

const ManageMovies = () => {
	return (
		<div>
			<Tabs defaultValue="movies">
				<TabsList className={"w-full mx-auto xs:w-[400px]"}>
					<TabsTrigger value="movies">Movies</TabsTrigger>
					<TabsTrigger value="add-movie">Add Movie</TabsTrigger>
				</TabsList>
				<TabsContent value="movies">
					<MoviesListTabContent />
				</TabsContent>
				<TabsContent value="add-movie">
					<AddMovieInterface />
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default ManageMovies;
