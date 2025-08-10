// Test script to verify Supabase database setup
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

console.log("🔗 Testing Supabase connection...");

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  try {
    // Test 1: Basic connection
    console.log("\n📡 Test 1: Testing basic connection...");
    const { data, error } = await supabase
      .from("fits")
      .select("count")
      .limit(1);

    if (error) {
      console.error("❌ Connection failed:", error.message);
      return false;
    }

    console.log("✅ Connection successful!");

    // Test 2: Check if tables exist
    console.log("\n📊 Test 2: Checking table structure...");

    const tables = ["fits", "published_battles", "votes", "fit_comments"];
    for (const table of tables) {
      const { error } = await supabase.from(table).select("*").limit(1);
      if (error) {
        console.error(`❌ Table '${table}' not accessible:`, error.message);
        return false;
      }
      console.log(`✅ Table '${table}' is accessible`);
    }

    // Test 3: Test basic CRUD operations
    console.log("\n🔄 Test 3: Testing basic CRUD operations...");

    // Create a test fit
    const testFit = {
      name: "Test Fit",
      description: "Test description",
      total_price_cents: 5000,
      products: [{ id: "test1", name: "Test Product", price: 5000 }],
    };

    const { data: createdFit, error: createError } = await supabase
      .from("fits")
      .insert(testFit)
      .select()
      .single();

    if (createError) {
      console.error("❌ Failed to create test fit:", createError.message);
      return false;
    }

    console.log("✅ Test fit created successfully");

    // Read the created fit
    const { data: readFit, error: readError } = await supabase
      .from("fits")
      .select("*")
      .eq("id", createdFit.id)
      .single();

    if (readError || !readFit) {
      console.error("❌ Failed to read test fit:", readError?.message);
      return false;
    }

    console.log("✅ Test fit read successfully");

    // Update the test fit
    const { error: updateError } = await supabase
      .from("fits")
      .update({ name: "Updated Test Fit" })
      .eq("id", createdFit.id);

    if (updateError) {
      console.error("❌ Failed to update test fit:", updateError.message);
      return false;
    }

    console.log("✅ Test fit updated successfully");

    // Delete the test fit
    const { error: deleteError } = await supabase
      .from("fits")
      .delete()
      .eq("id", createdFit.id);

    if (deleteError) {
      console.error("❌ Failed to delete test fit:", deleteError.message);
      return false;
    }

    console.log("✅ Test fit deleted successfully");

    // Test 4: Test trigger functionality
    console.log("\n⚡ Test 4: Testing trigger functionality...");

    // Create two test fits
    const fitA = {
      name: "Fit A",
      description: "Test fit A",
      total_price_cents: 3000,
      products: [{ id: "a1", name: "Product A1", price: 3000 }],
    };

    const fitB = {
      name: "Fit B",
      description: "Test fit B",
      total_price_cents: 4000,
      products: [{ id: "b1", name: "Product B1", price: 4000 }],
    };

    const { data: createdFitA } = await supabase
      .from("fits")
      .insert(fitA)
      .select()
      .single();
    const { data: createdFitB } = await supabase
      .from("fits")
      .insert(fitB)
      .select()
      .single();

    // Create a battle
    const { data: battle } = await supabase
      .from("published_battles")
      .insert({
        fit_a_id: createdFitA.id,
        fit_b_id: createdFitB.id,
      })
      .select()
      .single();

    console.log("✅ Battle created successfully");

    // Add a vote and check if trigger updates vote count
    const { error: voteError } = await supabase.from("votes").insert({
      battle_id: battle.id,
      user_id: "test-user-1",
      chosen_fit_id: createdFitA.id,
    });

    if (voteError) {
      console.error("❌ Failed to create vote:", voteError.message);
      return false;
    }

    console.log("✅ Vote created successfully");

    // Check if vote count was updated by trigger
    const { data: updatedBattle } = await supabase
      .from("published_battles")
      .select("votes_a, votes_b, total_votes")
      .eq("id", battle.id)
      .single();

    if (updatedBattle.votes_a === 1 && updatedBattle.total_votes === 1) {
      console.log("✅ Trigger successfully updated vote counts");
    } else {
      console.error("❌ Trigger failed to update vote counts:", updatedBattle);
      return false;
    }

    // Clean up test data
    await supabase.from("votes").delete().eq("battle_id", battle.id);
    await supabase.from("published_battles").delete().eq("id", battle.id);
    await supabase.from("fits").delete().eq("id", createdFitA.id);
    await supabase.from("fits").delete().eq("id", createdFitB.id);

    console.log("✅ Test data cleaned up");

    console.log("\n🎉 All tests passed! Your database is properly set up.");
    return true;
  } catch (error) {
    console.error("❌ Test failed with unexpected error:", error);
    return false;
  }
}

// Run the tests
testDatabase().then((success) => {
  if (!success) {
    console.log(
      "\n❌ Database setup verification failed. Please check your Supabase configuration."
    );
    process.exit(1);
  }
  process.exit(0);
});
