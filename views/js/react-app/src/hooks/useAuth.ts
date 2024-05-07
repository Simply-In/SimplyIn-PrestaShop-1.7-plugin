import { useState } from "react"

export const useAuth = () => {

	const [authToken, setAuthToken] = useState("")


	return { authToken, setAuthToken }
}