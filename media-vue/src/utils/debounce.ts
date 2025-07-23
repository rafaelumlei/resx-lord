export default function debounce(fn: () => any, delay: number) {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	return function () {
		// Clear the previous timeout
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
		}

		// Set a new timeout
		timeoutId = setTimeout(() => {
			timeoutId = undefined;
			fn();
		}, delay);
	};
}