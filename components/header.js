function Header() {
  return (
    <View className="px-6 pb-4 flex-row items-center justify-between bg-[#0B0F14]/90 border-b border-[#0da6f2]/10">
      <View>
        <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0da6f2]/70">
          ProAnalytics Medical
        </Text>
        <Text className="text-xl font-bold text-white">Motion Performance</Text>
      </View>

      <View className="flex-row items-center gap-2 px-3 py-1 rounded-full bg-[#39ff14]/10 border border-[#39ff14]/20">
        <View className="w-2 h-2 rounded-full bg-[#39ff14]" />
        <Text className="text-[10px] font-bold tracking-[0.3em] text-[#39ff14] uppercase">
          Live
        </Text>
      </View>
    </View>
  );
}
