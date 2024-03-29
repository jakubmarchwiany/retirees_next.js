/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/unbound-method */
"use client";

import type { EmotionCache, Options as OptionsOfCreateCache } from "@emotion/cache";

import createCache from "@emotion/cache";
import { CacheProvider as DefaultCacheProvider } from "@emotion/react";
import { useServerInsertedHTML } from "next/navigation";
import * as React from "react";

export type NextAppDirEmotionCacheProviderProps = {
	/** This is the options passed to createCache() from 'import createCache from "@emotion/cache"' */
	options: Omit<OptionsOfCreateCache, "insertionPoint">;
	/** By default <CacheProvider /> from 'import { CacheProvider } from "@emotion/react"' */
	CacheProvider?: (props: {
		value: EmotionCache;
		children: React.ReactNode;
	}) => React.JSX.Element | null;
	children: React.ReactNode;
};

// Adapted from https://github.com/garronej/tss-react/blob/main/src/next/appDir.tsx
export default function NextAppDirEmotionCacheProvider(
	props: NextAppDirEmotionCacheProviderProps
): JSX.Element {
	const { options, CacheProvider = DefaultCacheProvider, children } = props;

	const [registry] = React.useState(() => {
		const cache = createCache(options);

		cache.compat = true;

		const prevInsert = cache.insert;
		let inserted: Array<{ name: string; isGlobal: boolean }> = [];

		cache.insert = (...args) => {
			const [selector, serialized] = args;

			if (cache.inserted[serialized.name] === undefined) {
				inserted.push({
					isGlobal: !selector,
					name: serialized.name
				});
			}
			return prevInsert(...args);
		};

		const flush = () => {
			const prevInserted = inserted;

			inserted = [];

			return prevInserted;
		};

		return { cache, flush };
	});

	useServerInsertedHTML(() => {
		const inserted = registry.flush();

		if (inserted.length === 0) {
			return null;
		}
		let styles = "";
		let dataEmotionAttribute = registry.cache.key;

		const globals: Array<{
			name: string;
			style: string;
		}> = [];

		inserted.forEach(({ name, isGlobal }) => {
			const style = registry.cache.inserted[name];

			if (typeof style !== "boolean") {
				if (isGlobal && style !== undefined) {
					globals.push({ name, style });
				} else {
					styles += style;

					dataEmotionAttribute += ` ${name}`;
				}
			}
		});

		return (
			<React.Fragment>
				{globals.map(({ name, style }) => (
					<style
						dangerouslySetInnerHTML={{ __html: style }}
						data-emotion={`${registry.cache.key}-global ${name}`}
						key={name}
					/>
				))}
				{styles && (
					<style
						dangerouslySetInnerHTML={{ __html: styles }}
						data-emotion={dataEmotionAttribute}
					/>
				)}
			</React.Fragment>
		);
	});

	return <CacheProvider value={registry.cache}>{children}</CacheProvider>;
}
