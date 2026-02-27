import { createClient } from "@supabase/supabase-js";

// This file will be our singlton for our supabase client
// just import this file and call supabase.whateverFunctionYouNeed

// TODO: For now all the supabase session stuff is commented out until we figure out our account details
// and set up out environemnt variables.
// The commented out code is taken directly from the supabase react setup guide

// Example usage of supabase taken directly from the supabse and react tutorial on their website

export const supabase = null;

/*
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// example usage from website
{
  const [instruments, setInstruments] = useState([]);
  useEffect(() => {
    getInstruments();
  }, []);
  async function getInstruments() {
    const { data } = await supabase.from("instruments").select();
    setInstruments(data);
  }
  return (
    <ul>
      {instruments.map((instrument) => (
        <li key={instrument.name}>{instrument.name}</li>
      ))}
    </ul>
  );
}*/