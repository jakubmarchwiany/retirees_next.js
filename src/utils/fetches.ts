import Cookies from "js-cookie";
import toast from "react-hot-toast";

import { authorizationFail } from "./log_out";

const NEXT_PUBLIC_API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
const NODE_ENV = process.env.NODE_ENV;

export async function getFetch<T>(
	url: string,
	options?: { customError?: boolean }
): Promise<T & { message: string }> {
	return await new Promise((resolve, reject) => {
		const toastId = toast.loading("Ładowanie...");

		fetch(NEXT_PUBLIC_API_ENDPOINT + url, {
			method: "GET",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${Cookies.get("authorization")}`
			}
		})
			.then(async (response) => {
				const data = (await response.json()) as T & { message: string };

				if (response.ok) {
					toast.success(data.message, { id: toastId });

					resolve(data);
				} else {
					toast.error(data.message, { id: toastId });

					if (response.status === 401) {
						await authorizationFail();
					}

					if (options?.customError !== undefined) {
						reject(data);
					}
				}
			})
			.catch((error) => {
				console.log(error);

				toast.error("Coś poszło nie tak :(", { id: toastId });

				if (options?.customError !== undefined) {
					reject(error);
				}
			});
	});
}

export async function postFetch<T>(
	body: object,
	url: string,
	options?: { customError?: boolean }
): Promise<T & { message: string }> {
	return await new Promise((resolve, reject) => {
		const toastId = toast.loading("Ładowanie...");

		fetch(NEXT_PUBLIC_API_ENDPOINT + url, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${Cookies.get("authorization")}`
			},
			body: JSON.stringify(body)
		})
			.then(async (response) => {
				const data = (await response.json()) as T & { message: string };

				if (response.ok) {
					toast.success(data.message, { id: toastId });

					resolve(data);
				} else {
					toast.error(data.message, { id: toastId });

					if (response.status === 401) {
						await authorizationFail();
					}

					if (options?.customError !== undefined) {
						reject(data);
					}
				}
			})
			.catch((error) => {
				if (NODE_ENV === "development") {
					console.log(error);
				}

				toast.error("Coś poszło nie tak :(", { id: toastId });

				if (options?.customError !== undefined) {
					reject(error);
				}
			});
	});
}