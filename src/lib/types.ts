export type CommentStatus = "pending" | "approved" | "rejected";

export interface Album {
	id: string;
	slug: string;
	title: string;
	season: string | null;
	year: number | null;
	description: string | null;
	cover_photo_id: string | null;
	sort_order: number;
	published: boolean;
	created_at: string;
}

export interface Photo {
	id: string;
	slug: string;
	album_id: string | null;
	width: number;
	height: number;
	lqip: string | null;
	title: string | null;
	caption: string | null;
	original_ext: string;
	taken_at: string | null;
	camera: string | null;
	lens: string | null;
	iso: number | null;
	aperture: number | null;
	shutter_speed: number | null;
	focal_length: number | null;
	gps_lat: number | null;
	gps_lng: number | null;
	file_hash: string;
	published: boolean;
	sort_order: number;
	created_at: string;
}

export interface PhotoWithStats extends Photo {
	like_count: number;
	comment_count: number;

	album_slug: string | null;
}

export interface AlbumWithCover extends Album {
	photo_count: number;
	cover: Pick<Photo, "slug" | "width" | "height" | "lqip"> | null;
}

export interface Comment {
	id: string;
	photo_id: string;
	author_name: string;
	body: string;
	status: CommentStatus;
	created_at: string;
}

export interface Video {
	id: string;
	youtube_id: string;
	title: string;
	description: string | null;
	published: boolean;
	sort_order: number;
	created_at: string;
}
