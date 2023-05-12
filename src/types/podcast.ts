import { EpisodeType } from './episode';

export type PodcastType = {
    title: string,
    description?: string,
    link?: string,
    feed: string,
    thumbnail?: string,
    episodes: Record<string, EpisodeType>
};
