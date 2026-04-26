const URL = "https://signup-iuxeocrkta-uc.a.run.app";

export const signUp = async (email: string, password: string) => {
  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return { success: true, data: await response.json() };
};
