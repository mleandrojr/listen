import { EpisodeType } from './episode';

export type PodcastType = {
    label: string,
    description?: string,
    link?: string,
    feed: string,
    thumbnail?: string,
    episodes: Record<string, EpisodeType>
};
